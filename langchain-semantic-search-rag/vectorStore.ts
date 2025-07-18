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
 * @throws {Error} If PDF file doesn't exist or can't be processed
 */
export async function loadOrCreateVectorStore(pdfFilePath: string): Promise<MemoryVectorStore> {
  // Validate PDF file exists
  if (!existsSync(pdfFilePath)) {
    throw new Error(`PDF file not found: ${pdfFilePath}`);
  }

  const embeddings = new OpenAIEmbeddings({ model: EMBEDDINGS_MODEL });

  // Check if we have cached embeddings to avoid regenerating
  if (existsSync(CACHE_FILE)) {
    try {
      console.log("Loading cached embeddings...");
      const cacheData = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
      
      // Validate cache structure
      if (!cacheData.texts || !cacheData.metadatas || !cacheData.embeddings) {
        console.warn("Invalid cache structure, regenerating embeddings...");
        return createNewEmbeddings(pdfFilePath, embeddings);
      }

      const { texts, metadatas, embeddings: cachedEmbeddings } = cacheData;
      
      // Create vector store with cached embeddings (no API calls needed)
      const vectorStore = new MemoryVectorStore(embeddings);
      await vectorStore.addVectors(cachedEmbeddings, texts.map((text: string, i: number) => ({
        pageContent: text,
        metadata: metadatas[i]
      })));
      
      console.log("✅ Cached embeddings loaded!");
      return vectorStore;
    } catch (error) {
      console.warn("Error loading cache, regenerating embeddings:", error);
      return createNewEmbeddings(pdfFilePath, embeddings);
    }
  }

  return createNewEmbeddings(pdfFilePath, embeddings);
}

/**
 * Creates new embeddings from PDF file
 * @param pdfFilePath - Path to the PDF file
 * @param embeddings - OpenAI embeddings instance
 */
async function createNewEmbeddings(pdfFilePath: string, embeddings: OpenAIEmbeddings): Promise<MemoryVectorStore> {
  console.log(`Creating new embeddings from: ${pdfFilePath}`);
  
  try {
    // Load and split the PDF document into chunks
    const loader = new PDFLoader(pdfFilePath);
    const docs = await loader.load();
    
    if (docs.length === 0) {
      throw new Error(`No content could be extracted from PDF: ${pdfFilePath}`);
    }
    
    // Split documents into smaller chunks for better retrieval
    const splits = await new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    }).splitDocuments(docs);
    
    if (splits.length === 0) {
      throw new Error(`No text chunks created from PDF: ${pdfFilePath}`);
    }
    
    console.log(`Split document into ${splits.length} chunks`);
    
    // Create vector store and generate embeddings (API calls happen here)
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(splits);
    
    // Cache the embeddings for future use
    const vectorData = (vectorStore as any).memoryVectors;
    const cacheData = {
      texts: vectorData.map((v: any) => v.content),
      metadatas: vectorData.map((v: any) => v.metadata),
      embeddings: vectorData.map((v: any) => v.embedding),
    };
    
    writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(`✅ Embeddings cached to ${CACHE_FILE}`);
    
    return vectorStore;
  } catch (error) {
    console.error(`Failed to create embeddings from ${pdfFilePath}:`, error);
    throw error;
  }
} 