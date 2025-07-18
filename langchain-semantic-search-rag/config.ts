// Model configurations
export const EMBEDDINGS_MODEL = "text-embedding-3-large";
export const CHAT_MODEL = "gpt-4.1";

// File paths
export const PDF_FILE = './docs/nke-10k-2023.pdf';
export const CACHE_FILE = './embeddings-cache.json';

// Search parameters
export const SEARCH_TYPE = "mmr"; // Maximal Marginal Relevance - Balances relevance and diversity
export const K = 3; // Number of documents to retrieve

// Document processing parameters
export const CHUNK_SIZE = 1000; // Size of each chunk
export const CHUNK_OVERLAP = 200; // Overlap between chunks to preserve context 