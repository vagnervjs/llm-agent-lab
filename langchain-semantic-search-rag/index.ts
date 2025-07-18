import 'dotenv/config';

// Vector store module
import { loadOrCreateVectorStore } from './vectorStore';

// Chat and prompts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Document } from "@langchain/core/documents";

// Configuration
import { CHAT_MODEL, SEARCH_TYPE, K, PDF_FILE } from './config';

// Constants
const DEFAULT_QUESTION = "What is Nike's revenue in 2023?";

/**
 * Main RAG pipeline: Retrieve relevant documents and generate answer
 * @param question - The user's question to answer
 * @throws {Error} If question is empty or processing fails
 */
async function main(question: string): Promise<void> {
  // Validate input
  if (!question.trim()) {
    throw new Error("Question cannot be empty");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  try {
    console.log(`Question: ${question}`);
    
    // Step 1: Load or create vector store with embeddings
    const vectorStore = await loadOrCreateVectorStore(PDF_FILE);
    
    // Step 2: Set up retriever with search type and number of top documents to retrieve
    const retriever = vectorStore.asRetriever({ 
      searchType: SEARCH_TYPE,
      k: K
    });
    
    // Step 3: Set up the language model and prompt
    const model = new ChatOpenAI({ 
      model: CHAT_MODEL, 
      temperature: 0,
      timeout: 30000, // 30 second timeout
    });
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Use only the provided context to answer the question. If the answer is not in the context, say so. Keep it concise.\n\nContext: {context}"],
      ["human", "{question}"],
    ]);
    
    // Step 4: Retrieve relevant documents based on the user question
    const docs: Document[] = await retriever.invoke(question);
    
    if (docs.length === 0) {
      console.log("No relevant documents found for the question.");
      return;
    }
    
    const context = docs.map(doc => doc.pageContent).join("\n\n");
    console.log(`Documents retrieved: ${docs.length}; Context length: ${context.length}`);
    
    if (context.length === 0) {
      console.log("Retrieved documents contain no content.");
      return;
    }
    
    // Step 5: Generate answer using retrieved context
    const response = await model.invoke(await prompt.invoke({ context, question }));
    
    if (typeof response.content === 'string') {
      console.log(`Answer: ${response.content}`);
    } else {
      console.log("Answer: [Non-text response received]");
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('API key')) {
        console.error("Please ensure your OPENAI_API_KEY is set in the .env file");
      } else if (error.message.includes('PDF file not found')) {
        console.error(`Please ensure the PDF file exists at: ${PDF_FILE}`);
      } else if (error.message.includes('rate limit')) {
        console.error("OpenAI API rate limit exceeded. Please try again later.");
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

/**
 * Parse and validate command line arguments
 * @returns The question to process
 */
function parseArguments(): string {
  const args = process.argv.slice(2);
  const question = args.length > 0 ? args.join(' ').trim() : DEFAULT_QUESTION;
  
  if (args.length === 0) {
    console.log("No question provided. Using default question.");
    console.log("Usage: npx tsx index.ts \"Your question here\"");
  }
  
  return question;
}

// Run the RAG pipeline
(async () => {
  try {
    const question = parseArguments();
    await main(question);
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
})();
