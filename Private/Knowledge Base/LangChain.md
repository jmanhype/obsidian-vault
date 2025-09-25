# LangChain

**Type**: AI Framework  
**Domain**: LLM Application Development  
**Founded**: 2022  
**Creator**: Harrison Chase  
**License**: MIT License  
**Context**: Building Context-Aware AI Applications

## Overview

LangChain is a comprehensive framework for developing applications powered by large language models (LLMs). It simplifies every stage of the LLM application lifecycle through modular components, standardized interfaces, and production-ready tooling.

## Core Philosophy

> "Making it easy to build applications that are context-aware and reasoning-enabled."

LangChain enables developers to:
- **Connect** language models to external data sources
- **Chain** multiple LLM calls and actions together
- **Remember** context across interactions
- **Act** through tools and APIs
- **Deploy** prototypes to production seamlessly

## Architecture

### Package Structure

```
langchain-ecosystem/
├── langchain-core/          # Base abstractions
├── langchain/               # Chains, agents, retrieval
├── langchain-community/     # Community integrations
├── langchain-openai/        # OpenAI integration
├── langchain-anthropic/     # Anthropic integration
├── langgraph/              # Stateful orchestration
└── langserve/              # REST API deployment
```

### Component Hierarchy

```python
# Core abstractions flow
Runnable Interface
    ↓
Base Components (LLMs, Prompts, Tools)
    ↓
Chains (Sequential composition)
    ↓
Agents (Dynamic reasoning)
    ↓
Applications (Full systems)
```

## Key Components

### 1. Chains

Chains are sequences of calls to LLMs or other utilities:

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Simple chain example
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?"
)

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run("colorful socks")
```

**Chain Types:**
- **Simple Chains**: Single LLM invocation
- **Sequential Chains**: Multiple steps in sequence
- **Router Chains**: Dynamic routing based on input
- **Transform Chains**: Data transformation pipelines

### 2. Agents

Agents use LLMs as reasoning engines to determine actions:

```python
from langchain.agents import create_react_agent
from langchain.tools import Tool

tools = [
    Tool(
        name="Calculator",
        func=calculator.run,
        description="Useful for math calculations"
    ),
    Tool(
        name="Search",
        func=search.run,
        description="Search the internet for information"
    )
]

agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=agent_prompt
)
```

**Agent Types:**
- **ReAct**: Reasoning and acting in interleaved fashion
- **Plan-and-Execute**: Plans full sequence then executes
- **OpenAI Functions**: Uses function calling
- **Conversational**: Maintains conversation history

### 3. Memory

Memory systems for maintaining context:

```python
from langchain.memory import ConversationBufferMemory

# Buffer memory for full history
memory = ConversationBufferMemory()

# Summary memory for long conversations
from langchain.memory import ConversationSummaryMemory
memory = ConversationSummaryMemory(llm=llm)

# Window memory for recent context
from langchain.memory import ConversationBufferWindowMemory
memory = ConversationBufferWindowMemory(k=5)  # Last 5 exchanges
```

**Memory Types:**
- **Buffer Memory**: Stores complete history
- **Summary Memory**: Summarizes older interactions
- **Window Memory**: Keeps recent k exchanges
- **Entity Memory**: Tracks specific entities
- **Knowledge Graph Memory**: Builds relationship graph

### 4. Tools

External functions agents can use:

```python
from langchain.tools import tool

@tool
def get_weather(location: str) -> str:
    """Get the weather for a location."""
    # Implementation
    return f"Weather in {location}: Sunny, 72°F"

# Built-in tools
from langchain.tools import DuckDuckGoSearchRun
from langchain.tools import PythonREPLTool
from langchain.tools import ShellTool
```

**Common Tools:**
- Web search (DuckDuckGo, Google, Bing)
- Code execution (Python REPL, Shell)
- Database queries (SQL, Vector stores)
- API integrations (REST, GraphQL)
- File operations (Read, Write, Parse)

### 5. Document Loaders & Indexes

For working with external data:

```python
from langchain.document_loaders import TextLoader
from langchain.indexes import VectorstoreIndexCreator

# Load documents
loader = TextLoader('data.txt')
documents = loader.load()

# Create searchable index
index = VectorstoreIndexCreator().from_loaders([loader])

# Query the index
response = index.query("What is the main topic?")
```

## LangChain Expression Language (LCEL)

Declarative way to compose chains:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# LCEL chain composition
chain = (
    ChatPromptTemplate.from_template("Tell me a joke about {topic}")
    | model
    | StrOutputParser()
)

# Invoke with automatic batching, streaming, async
result = chain.invoke({"topic": "programming"})
```

**LCEL Benefits:**
- Automatic streaming support
- Parallel execution
- Retries and fallbacks
- Access to intermediate results
- Easy composition

## LangGraph

Advanced orchestration for stateful applications:

```python
from langgraph.graph import StateGraph

# Define stateful workflow
workflow = StateGraph(State)

# Add nodes (functions)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

# Add edges (transitions)
workflow.add_edge("agent", "tools")
workflow.add_conditional_edge(
    "tools",
    should_continue,
    {"continue": "agent", "end": END}
)

# Compile to runnable
app = workflow.compile()
```

**LangGraph Features:**
- State persistence
- Checkpointing
- Time travel debugging
- Human-in-the-loop
- Multi-agent coordination

## LangServe

Deploy chains as REST APIs:

```python
from langserve import add_routes

# FastAPI app
app = FastAPI()

# Add chain as API endpoint
add_routes(
    app,
    chain,
    path="/my-chain"
)

# Automatic endpoints:
# POST /my-chain/invoke
# POST /my-chain/batch
# POST /my-chain/stream
# GET /my-chain/playground
```

## Integration Ecosystem

### LLM Providers
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Google (PaLM, Gemini)
- Cohere
- Hugging Face
- Local models (Ollama, llama.cpp)

### Vector Stores
- Pinecone
- Weaviate
- Chroma
- FAISS
- Qdrant
- Milvus

### Data Sources
- Web scraping
- PDFs, Word, PowerPoint
- Notion, Confluence
- GitHub, GitLab
- Slack, Discord
- SQL databases

## Best Practices

### 1. Start Simple
```python
# Begin with basic chains before agents
chain = prompt | llm | output_parser
```

### 2. Use Appropriate Memory
```python
# Choose memory based on conversation length
if expected_length < 10:
    memory = ConversationBufferMemory()
else:
    memory = ConversationSummaryMemory(llm=llm)
```

### 3. Handle Errors Gracefully
```python
from langchain.callbacks import RetryCallbackHandler

chain.invoke(
    input,
    config={"callbacks": [RetryCallbackHandler(max_retries=3)]}
)
```

### 4. Monitor Token Usage
```python
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    result = chain.run(input)
    print(f"Tokens used: {cb.total_tokens}")
```

## Common Patterns

### RAG (Retrieval-Augmented Generation)
```python
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)
```

### Conversational Agent
```python
from langchain.agents import ConversationalAgent

agent = ConversationalAgent.from_llm_and_tools(
    llm=llm,
    tools=tools,
    memory=memory
)
```

### Document Q&A
```python
from langchain.chains.question_answering import load_qa_chain

chain = load_qa_chain(llm, chain_type="map_reduce")
answer = chain.run(input_documents=docs, question=query)
```

## Limitations

- **Complexity**: Can become complex for simple use cases
- **Abstraction Overhead**: Many layers of abstraction
- **Debugging**: Can be difficult to debug complex chains
- **Version Changes**: Rapid development means frequent updates
- **Token Costs**: Easy to accidentally use many tokens

## Getting Started

```bash
# Installation
pip install langchain langchain-openai

# Basic setup
export OPENAI_API_KEY="your-key"
```

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# Initialize
llm = ChatOpenAI(model="gpt-4")
prompt = ChatPromptTemplate.from_template("Tell me about {topic}")

# Create chain
chain = prompt | llm

# Run
result = chain.invoke({"topic": "quantum computing"})
```

## Related Concepts

- [[LangGraph]] - Stateful orchestration extension
- [[LangServe]] - Deployment framework
- [[LCEL]] - Expression language
- [[Vector Databases]] - Similarity search
- [[RAG Pattern]] - Retrieval augmentation
- [[Agent Architectures]] - Design patterns
- [[Prompt Engineering]] - Template design
- [[Memory Management Systems]] - Context preservation
- [[Automagik Hive]] - Alternative framework
- [[AutoGPT]] - Autonomous agents
- [[CrewAI]] - Multi-agent framework
- [[OpenAI Function Calling]] - Tool use
- [[Semantic Search]] - Information retrieval

## Resources

- [Official Documentation](https://python.langchain.com)
- [GitHub Repository](https://github.com/langchain-ai/langchain)
- [LangSmith](https://smith.langchain.com) - Observability platform
- [Templates Gallery](https://python.langchain.com/docs/templates)
- [Community Discord](https://discord.gg/langchain)

## Zero-Entropy Statement

"LangChain transforms LLMs from isolated oracles into connected, reasoning systems that remember, act, and evolve."

---
*The foundation framework for context-aware LLM applications*