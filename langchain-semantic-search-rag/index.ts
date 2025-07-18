import 'dotenv/config';

// Vector store module
import { loadOrCreateVectorStore } from './vectorStore';

// Chat and prompts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Configuration
import { CHAT_MODEL, SEARCH_TYPE, K, PDF_FILE } from './config';

/**
 * Main RAG pipeline: Retrieve relevant documents and generate answer
 * @param question - The user's question to answer
 */
async function main(question: string) {
  try {
    // Step 1: Load or create vector store with embeddings
    const vectorStore = await loadOrCreateVectorStore(PDF_FILE);
    
    // Step 2: Set up retriever with search type and number of top documents to retrieve
    const retriever = vectorStore.asRetriever({ 
      searchType: SEARCH_TYPE,
      k: K
    });
    
    // Step 3: Set up the language model and prompt
    const model = new ChatOpenAI({ model: CHAT_MODEL, temperature: 0 });
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Use only the provided context to answer the question. If the answer is not in the context, say so. Keep it concise.\n\nContext: {context}"],
      ["human", "{question}"],
    ]);
    
    console.log(`Question: ${question}`);
    
    // Step 4: Retrieve relevant documents based on the user question
    const docs = await retriever.invoke(question);
    const context = docs.map(doc => doc.pageContent).join("");
    console.log(`Documents retrieved: ${docs.length}; Context length: ${context.length}`);
    
    // Step 5: Generate answer using retrieved context
    const response = await model.invoke(await prompt.invoke({ context, question }));
    console.log(`Answer: ${response.content}`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Get question from CLI arguments or use default as example
const args = process.argv.slice(2);
const question = args.length > 0 ? args.join(' ') : "Nike's revenue in 2023?";

if (args.length === 0) {
  console.log("No question provided. Using default question.");
  console.log("Usage: npx tsx index.ts \"Your question here\"");
}

// Run the RAG pipeline
main(question);
