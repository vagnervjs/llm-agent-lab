import { existsSync, writeFileSync, readFileSync } from 'fs';

// Document loading
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Embeddings and vector store
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Configuration
import { EMBEDDINGS_MODEL, CACHE_FILE, CHUNK_SIZE, CHUNK_OVERLAP } from './config';

/**
 * Loads cached embeddings if available, otherwise creates new ones from PDF
 * This saves API calls and processing time on subsequent runs
 * @param pdfFilePath - Path to the PDF file to process
 */
export async function loadOrCreateVectorStore(pdfFilePath: string): Promise<MemoryVectorStore> {
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
  console.log(`Creating new embeddings from: ${pdfFilePath}`);
  
  // Load and split the PDF document into chunks
  const loader = new PDFLoader(pdfFilePath);
  const docs = await loader.load();
  
  // Split documents into smaller chunks for better retrieval
  const splits = await new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE, // Size of each chunk
    chunkOverlap: CHUNK_OVERLAP, // Overlap between chunks to preserve context
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