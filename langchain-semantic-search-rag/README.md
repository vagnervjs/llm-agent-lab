# LangChain Semantic Search RAG System

A **Retrieval-Augmented Generation (RAG)** system built with LangChain that demonstrates efficient semantic search with persistent embeddings caching. This implementation saves costs by avoiding repeated OpenAI API calls while maintaining high-quality document retrieval and answer generation.

## 🚀 Features

- **📄 PDF Document Processing** - Load and process large documents (Nike 10-K used as example)
- **🔍 Semantic Search** - Find relevant information using vector similarity search
- **💾 Persistent Embeddings Cache** - Save embeddings to JSON file to avoid repeated API calls
- **🎯 MMR Retrieval** - Maximal Marginal Relevance algorithm for diverse, relevant results
- **⚡ Fast Startup** - Instant loading from cached embeddings on subsequent runs
- **🛠️ Easy Configuration** - All settings in constants for easy modification
- **📚 Well Documented** - Clear code structure with comprehensive comments

## 🏗️ Architecture

```
User Question → Document Retrieval → Context Generation → LLM Response
             ↗                    ↘
    Vector Store (Cached)     Relevant Chunks
```

### Key Components:
1. **Document Loader** - Loads PDF and splits into chunks
2. **Embedding Generator** - Creates vector representations (cached after first run)
3. **Vector Store** - Stores and searches embeddings efficiently
4. **Retriever** - Finds most relevant document chunks
5. **LLM Chain** - Generates answers using retrieved context

## 📦 Installation

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

1. **Clone and navigate to project:**
```bash
cd playground/llm-agent-lab/langchain-semantic-search
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

4. **Add your PDF document:**
```bash
mkdir -p docs
# Place your PDF in docs/nke-10k-2023.pdf (or update PDF_FILE constant)
```

## 🎯 Usage

### Basic Usage

Run with the default question:
```bash
npx tsx index.ts
```

Run with a custom question:
```bash
npx tsx index.ts "What are Nike's main business segments?"
```

Run with multi-word questions (use quotes):
```bash
npx tsx index.ts "How did Nike's revenue change from 2022 to 2023?"
```

### Example Questions

```bash
# Financial information
npx tsx index.ts "What was Nike's net income in 2023?"

# Business operations
npx tsx index.ts "What are Nike's key growth strategies?"

# Risk factors
npx tsx index.ts "What are the main risks Nike faces?"

# Market analysis
npx tsx index.ts "How does Nike compete in the marketplace?"
```

### First Run (Creates Embeddings)
```
Creating new embeddings from: ./docs/nke-10k-2023.pdf
✅ Embeddings cached!
Question: Nike's revenue in 2023?
Documents retrieved: 3; Context length: 2847
Answer: Nike's revenue in fiscal 2023 was $51.2 billion...
```

### Subsequent Runs (Loads from Cache)
```
Loading cached embeddings...
✅ Cached embeddings loaded!
Question: What are Nike's main business segments?
Documents retrieved: 3; Context length: 2847
Answer: Nike operates through several main business segments...
```

## ⚙️ Configuration

All settings are configurable in `config.ts`:

```typescript
// Model configurations
export const EMBEDDINGS_MODEL = "text-embedding-3-large";
export const CHAT_MODEL = "gpt-4.1";

// File paths
export const PDF_FILE = './docs/nke-10k-2023.pdf';
export const CACHE_FILE = './embeddings-cache.json';

// Search parameters
export const SEARCH_TYPE = "mmr"; // Options: "mmr", "similarity"
export const K = 3; // Number of documents to retrieve

// Document processing parameters
export const CHUNK_SIZE = 1000; // Size of each chunk
export const CHUNK_OVERLAP = 200; // Overlap between chunks to preserve context

// Default question (used when no CLI argument provided)
export const QUESTION = "Nike's revenue in 2023?";
```

## 🔧 Advanced Configuration

### Chunking Strategy
```typescript
const splits = await new RecursiveCharacterTextSplitter({
  chunkSize: 1000,     // Size of each chunk
  chunkOverlap: 200,   // Overlap between chunks
}).splitDocuments(docs);
```

### Retrieval Methods
- **MMR (Maximal Marginal Relevance)** - Balances relevance and diversity
- **Similarity** - Pure similarity-based retrieval

### Model Options
- **Embeddings**: `text-embedding-3-large`, `text-embedding-3-small`, `text-embedding-ada-002`
- **Chat**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

## 💡 How Caching Works

### First Run
1. Loads PDF document
2. Splits into chunks
3. Generates embeddings via OpenAI API
4. Stores in vector database
5. Caches embeddings to JSON file

### Subsequent Runs
1. Loads cached embeddings from JSON
2. Reconstructs vector store (no API calls)
3. Ready for instant querying

### Cache File Structure
```json
{
  "texts": ["chunk1", "chunk2", ...],
  "metadatas": [{...}, {...}, ...],
  "embeddings": [[0.1, 0.2, ...], [0.3, 0.4, ...], ...]
}
```

## 📊 Performance Benefits

| Metric | First Run | Cached Run |
|--------|-----------|------------|
| Startup Time | ~30-60s | ~2-3s |
| API Calls | ~100+ | 1 (query only) |
| Cost | ~$0.10-0.50 | ~$0.001 |

## 🔄 Cache Management

### Regenerate Cache
```bash
rm embeddings-cache.json
npx tsx index.ts
```

### Cache Location
- Default: `./embeddings-cache.json`
- Size: ~2-10MB depending on document size

## 🐛 Troubleshooting

### Common Issues

1. **Empty Context Retrieved**
   - Check if PDF file exists and is readable
   - Verify OPENAI_API_KEY is set correctly
   - Try regenerating cache

2. **No Relevant Results**
   - Increase `K` value for more documents
   - Try different `SEARCH_TYPE` (mmr vs similarity)
   - Adjust chunking strategy

3. **API Rate Limits**
   - Use cached embeddings (should avoid this)
   - Implement retry logic if needed

## 🔗 Dependencies

### Core Dependencies
- `@langchain/openai` - OpenAI integration
- `@langchain/community` - Document loaders
- `langchain` - Core LangChain functionality
- `dotenv` - Environment variable management

### File Structure
```
langchain-semantic-search/
├── index.ts              # Main RAG implementation
├── package.json          # Dependencies
├── README.md            # This file
├── .env                 # Environment variables
├── docs/                # Document storage
│   └── nke-10k-2023.pdf
└── embeddings-cache.json # Generated cache file
```

## 🚀 Next Steps

### Potential Enhancements
- Multiple document support
- Web interface
- Different vector stores (Pinecone, Weaviate)
- Streaming responses
- Conversation history
- Source attribution

### Production Considerations
- Error handling improvements
- Logging system
- Monitoring and metrics
- Security for API keys
- Scalable vector storage

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and pull requests for improvements! 