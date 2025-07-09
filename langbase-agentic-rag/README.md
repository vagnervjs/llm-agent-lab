# LangBase Agentic RAG

A knowledge-based AI assistant built with [Langbase](https://langbase.com) that demonstrates how to create a reliable, citation-aware AI system using semantic memory and retrieval-augmented generation.

## 🚀 What It Does

This project implements a **two-stage agentic RAG system** that:

1. **Retrieves** relevant information from a knowledge base using semantic search
2. **Generates** accurate, cited responses using only the retrieved context
3. **Provides** proper source attribution with numbered citations

### Key Features

- ✅ **Semantic Search**: Finds relevant information using vector similarity
- ✅ **Source Attribution**: All responses include proper citations
- ✅ **Context-Aware**: Only answers from provided knowledge base
- ✅ **Honest Responses**: Admits when information isn't available
- ✅ **Extensible**: Easy to add new documents and capabilities

## 🏗️ Architecture

```
User Query → Memory Agent → Support Agent → Cited Response
           (Retrieval)    (Generation)
```

### Components

- **Memory Agent**: Performs semantic search on the knowledge base
- **Support Agent**: Generates responses with proper citations
- **Knowledge Base**: Stores documents with metadata for retrieval

## 📦 Setup

### Prerequisites

- Node.js 18+ 
- [Langbase API Key](https://langbase.com)

### Installation

1. Clone and navigate to the project:
```bash
cd playground/agentic-rag
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your LANGBASE_API_KEY to .env
```

4. Create the knowledge base:
```bash
npx tsx create-memory.ts
```

5. Create the AI agents:
```bash
npx tsx create-pipe.ts
```

6. Upload documents to the knowledge base:
```bash
npx tsx upload-docs.ts
```

## 🎯 Usage

### Basic Usage

```bash
npx tsx index.ts
```

### Programmatic Usage

```typescript
import { runMemoryAgent, runAiSupportAgent } from './agents';

async function askQuestion(query: string) {
    // Step 1: Retrieve relevant chunks
    const chunks = await runMemoryAgent(query);
    
    // Step 2: Generate cited response
    const completion = await runAiSupportAgent({
        chunks,
        query,
    });
    
    console.log(completion);
}

// Example queries
await askQuestion("What is agent parallelization?");
await askQuestion("How does Langbase handle memory?");
await askQuestion("What are the different agent architectures?");
```

### Example Output

```
Query: "What is agent parallelization?"

Response: "Agent parallelization is a method that runs multiple LLM tasks simultaneously to improve speed or accuracy. It works by splitting a task into independent parts (sectioning) or generating multiple responses for comparison (voting) [1].

Voting is a specific parallelization technique where multiple LLM calls generate different responses for the same task, and the best result is selected based on agreement, predefined rules, or quality evaluation [1].

Sources:
[1] agent-architectures.txt"
```

## 🧠 Memory & Documents

LangBase Memory is a serverless semantic search system that automatically converts your documents into searchable vector embeddings. When you upload documents, LangBase:

1. **Chunks** your documents into optimal segments
2. **Embeds** each chunk using advanced embedding models
3. **Indexes** the vectors for fast semantic retrieval
4. **Stores** metadata for filtering and organization

This allows the system to find relevant information based on meaning, not just keywords.

```typescript
// Upload a new document to memory
await langbase.memories.documents.upload({
    memoryName: 'knowledge-base',
    contentType: 'text/plain',
    documentName: 'your-document.txt',
    document: fileBuffer,
    meta: { 
        category: 'Documentation', 
        topic: 'Your Topic' 
    },
});
```

The memory system supports various content types (text, PDF, etc.) and automatically handles the complexity of vector search, making it easy to build knowledge-based AI systems.

## 🔧 Configuration

### Environment Variables

```bash
LANGBASE_API_KEY=your_api_key_here
```

### Customization Options

- **Retrieval Count**: Modify `topK` in `runMemoryAgent()` to change how many chunks are retrieved
- **Memory Name**: Change the memory name in both creation and retrieval
- **System Prompt**: Customize the AI assistant's behavior in `getSystemPrompt()`


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Langbase Documentation](https://langbase.com/docs)
- [Langbase SDK](https://www.npmjs.com/package/langbase)
- [Agent Architecture Patterns](https://langbase.com/docs/agents)

