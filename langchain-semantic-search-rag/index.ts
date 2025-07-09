import 'dotenv/config';
import { existsSync, writeFileSync, readFileSync } from 'fs';

// Document loading
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Embeddings and vector store
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Chat and prompts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Models
const EMBEDDINGS_MODEL = "text-embedding-3-large";
const CHAT_MODEL = "gpt-4.1";

// File paths
const PDF_FILE = './docs/nke-10k-2023.pdf';
const CACHE_FILE = './embeddings-cache.json';

// Search parameters
const SEARCH_TYPE = "mmr"; // Maximal Marginal Relevance - Balances relevance and diversity
const K = 3; // Number of documents to retrieve

// User Input
const QUESTION = "Nike's revenue in 2023?";

/**
 * Loads cached embeddings if available, otherwise creates new ones from PDF
 * This saves API calls and processing time on subsequent runs
 */
async function loadOrCreateVectorStore() {
  const embeddings = new OpenAIEmbeddings({ model: EMBEDDINGS_MODEL });

  // Check if we have cached embeddings to avoid regenerating
  if (existsSync(CACHE_FILE)) {
    console.log("Loading cached embeddings...");
    const { texts, metadatas, embeddings: cachedEmbeddings } = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    
    // Create vector store with cached embeddings (no API calls needed)
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addVectors(cachedEmbeddings, texts.map((text: string, i: number) => ({
      pageContent: text,
      metadata: metadatas[i]
    })));
    
    console.log("✅ Cached embeddings loaded!");
    return vectorStore;
  }

  // No cache found - create embeddings from scratch
  console.log("Creating new embeddings...");
  
  // Load and split the PDF document into chunks
  const loader = new PDFLoader(PDF_FILE);
  const docs = await loader.load();
  
  // Split documents into smaller chunks for better retrieval
  const splits = await new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Size of each chunk
    chunkOverlap: 200, // Overlap between chunks to preserve context
  }).splitDocuments(docs);
  
  // Create vector store and generate embeddings (API calls happen here)
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(splits);
  
  // Cache the embeddings for future use
  const vectorData = (vectorStore as any).memoryVectors;
  writeFileSync(CACHE_FILE, JSON.stringify({
    texts: vectorData.map((v: any) => v.content),
    metadatas: vectorData.map((v: any) => v.metadata),
    embeddings: vectorData.map((v: any) => v.embedding),
  }, null, 2));
  
  console.log(`✅ Embeddings cached!`);
  return vectorStore;
}

/**
 * Main RAG pipeline: Retrieve relevant documents and generate answer
 */
async function main() {
  try {
    // Step 1: Load or create vector store with embeddings
    const vectorStore = await loadOrCreateVectorStore();
    
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
    
    console.log(`Question: ${QUESTION}`);
    
    // Step 4: Retrieve relevant documents based on the user question
    const docs = await retriever.invoke(QUESTION);
    const context = docs.map(doc => doc.pageContent).join("");
    console.log(`Documents retrieved: ${docs.length}; Context length: ${context.length}`);
    
    // Step 5: Generate answer using retrieved context
    const response = await model.invoke(await prompt.invoke({ context, question: QUESTION }));
    console.log(`Answer: ${response.content}`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the RAG pipeline
main();
