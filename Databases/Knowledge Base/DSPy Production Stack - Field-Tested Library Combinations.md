# DSPy Production Stack - Field-Tested Library Combinations

**Date**: 2025-01-28  
**Tags**: #dspy #production #deployment #fastapi #mlflow #stack #libraries  
**Type**: Knowledge Base  
**Status**: Validated  

## Overview

**Core Philosophy**: Program-centric deployment where compiled DSPy programs are the deployment unit, not containers or schemas.

This is the field-tested menu of libraries and combinations that play directly with DSPy's program-centric deployment pattern. Mix and match based on your specific requirements.

## Core Serving & Program Lifecycle

### FastAPI + Uvicorn
- **Purpose**: Canonical way to expose compiled/optimized DSPy programs as HTTP
- **Integration**: `dspy.asyncify()` for production async serving
- **Why**: Direct program-to-API mapping with minimal overhead

### MLflow
- **Purpose**: Treat compiled DSPy programs as artifacts/models
- **Features**: Versioning, loading, rollback of optimized programs
- **Pattern**: `mlflow.dspy.log_model()` → `mlflow.pyfunc.load_model()`

### Pydantic
- **Purpose**: Strict I/O contracts for program signatures on API edge
- **Integration**: Type validation for DSPy program inputs/outputs
- **Benefit**: Runtime safety without performance penalty

### dotenv / Pydantic Settings
- **Purpose**: Environment-first config without leaking infrastructure into program code
- **Pattern**: Keep DSPy programs pure, externalize deployment concerns

## Inference Backends (Pick 1 Primary + 1 Fallback)

### OpenAI-Compatible Options
- **vLLM** (self-host): High throughput, OpenAI API compatibility
- **Text Generation Inference (TGI)**: Hugging Face's production serving
- **Ollama** (dev/demo): Local development and testing
- **LiteLLM/OpenRouter**: Provider routing, quotas, fallback handling

### Embedding Backends (RAG Support)
- **text-embeddings-inference**: Production-grade embedding service
- **Sentence-Transformers (HF)**: Local embedding computation
- **LiteLLM**: Unified embedding API across providers

## Retrieval & Memory (RAG Plug-ins)

### Vector Stores
- **FAISS** (local, simple): In-memory, single-node
- **Chroma** (quick start): SQLite-based, development-friendly
- **Qdrant** (production): gRPC, scalable, production-grade
- **Weaviate** (cloud-native): Managed vector database
- **pgvector** (Postgres): SQL + vectors in one system

### Hybrid Search
- **Elasticsearch/OpenSearch**: Sparse + dense retrieval when you need keyword + vector

## Datasets & Offline Corpora

### Data Processing
- **Hugging Face Datasets**: Streaming + splits for large corpora
- **PyArrow/Parquet + DuckDB**: Cheap, columnar, fast analytical scans
- **Polars**: Fast ETL when optimization loops touch wide tables

## Experiment Tracking & Evaluation

### Experiment Management
- **Weights & Biases (W&B)**: Log GEPA runs, metrics, artifacts
- **MLflow Tracking**: Alternative tracking with tight DSPy integration

### Testing
- **pytest + Hypothesis**: Property tests for signature invariants
- **Pattern**: Lock in behavior as programs evolve through optimization

## Caching & Queues

### Caching
- **Redis**: Feature and response cache, TTL'd tool outputs
- **diskcache**: Local development caching

### Background Processing
- **Celery** (Redis/RabbitMQ): Background jobs for long optimizations
- **Arq** (async Redis): Async task queue for batch compiles

## Concurrency & Scale-out

### Async Processing
- **asyncio**: Native with FastAPI + `dspy.asyncify()`

### Distributed Computing
- **Ray**: Distributed trials for GEPA sweeps
- **Dask**: Data-heavy map/reduce operations

## Observability & Safety

### Monitoring
- **Prometheus client + Grafana**: Latency, token/s, cache hit rate, error budgets
- **OpenTelemetry**: Traces from resolver → program → backend
- **Sentry**: Exception handling with input redaction

## Proven Combinations ("YES" Presets)

### 1. Lean API + Local Performance (Single Node)
```python
# Stack: FastAPI + Uvicorn + vLLM + FAISS + Redis + MLflow + Prometheus
```
**Components:**
- FastAPI + Uvicorn (serving)
- vLLM (OpenAI-compatible endpoint)
- FAISS (in-process vectors) + Redis (cache)
- MLflow (load compiled programs by run ID)
- Prometheus client (metrics)

**Why**: Lowest moving parts, great latency; perfect for productized PoC that still versions programs.

### 2. Production RAG + Model Registry
```python
# Stack: FastAPI + Qdrant + Elastic + LiteLLM + MLflow + W&B + Redis + OpenTelemetry
```
**Components:**
- FastAPI (HTTP + WebSocket streaming)
- Qdrant (remote vector DB via gRPC) + Elasticsearch (keyword)
- LiteLLM (provider routing/fallbacks)
- MLflow (registry) + W&B (dashboards)
- Redis (response + feature cache)
- OpenTelemetry + Prometheus + Sentry (observability)

**Why**: Resilient, observable, hot-swappable providers, clear rollback via model registry.

### 3. GEPA-at-Scale (Idea Mining / Exploration)
```python
# Stack: Ray + W&B Sweeps + DuckDB + Polars + TGI/vLLM + MLflow
```
**Components:**
- Ray (parallel GEPA trials) + W&B Sweeps (hyperparameter grids)
- DuckDB/Parquet (fast local corpora) + Polars (ETL)
- TGI or vLLM on GPU nodes (cheap throughput)
- MLflow (persist top programs)

**Why**: Crush search space quickly; artifacts and metrics are reproducible and queryable.

### 4. Cost-Guarded Serverless Edge
```python
# Stack: FastAPI + LiteLLM + pgvector + diskcache + Sentry
```
**Components:**
- FastAPI (or Litestar) + LiteLLM (quotas/guards)
- pgvector (managed Postgres) for minimal ops
- diskcache (edge-node local) + Sentry

**Why**: Simple ops, sane costs, still compatible with DSPy's program objects.

## Minimal Production Skeleton

```python
# serve.py
import os
import mlflow
import dspy
from fastapi import FastAPI
from pydantic import BaseModel
from redis import Redis

# 1) Load the optimized program from MLflow (program is your deployment unit)
RUN_ID = os.getenv("RUN_ID")
compiled = mlflow.pyfunc.load_model(f"runs:/{RUN_ID}/model")  # stored via mlflow.dspy.log_model(...)

# 2) Wrap for prod async
program = dspy.asyncify(compiled)

# 3) Edge types
class Question(BaseModel):
    text: str

class Answer(BaseModel):
    answer: str
    reasoning: str | None = None
    confidence: float | None = None

# 4) Infra helpers (black-boxed)
cache = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))

def cache_key(q: str) -> str:
    return f"dspy:ans:v1:{hash(q)}"

# 5) API
app = FastAPI()

@app.post("/predict", response_model=Answer)
async def predict(q: Question):
    if cached := cache.get(cache_key(q.text)):
        return Answer.model_validate_json(cached)

    res = await program(question=q.text)  # DSPy program call
    payload = {
        "answer": getattr(res, "answer", ""),
        "reasoning": getattr(res, "reasoning", None),
        "confidence": getattr(res, "confidence", None),
    }

    cache.setex(cache_key(q.text), 600, Answer(**payload).model_dump_json())
    return payload
```

**Deployment Pattern**: Swap FAISS→Qdrant, OpenAI→vLLM, or add Elasticsearch without touching the program's public API. That's the black-box win.

## Decision Rules (How to Choose)

### Speed on One Box
**Stack**: vLLM + FAISS + Redis  
**Use Case**: Single-node deployment with maximum performance

### Search Quality & Ops Safety  
**Stack**: Qdrant + Elasticsearch + LiteLLM + MLflow registry  
**Use Case**: Production systems requiring hybrid search and operational safety

### Idea Space Mining
**Stack**: Ray + W&B Sweeps + DuckDB  
**Use Case**: Optimize across large search spaces; promote winners to MLflow and serve with FastAPI

### Lowest Ops Complexity
**Stack**: pgvector + LiteLLM  
**Use Case**: Keep everything in Python, one repo, one process type

## Integration with Vault Patterns

### With Automagik Hive Architecture
- **Hierarchical Orchestration**: DSPy programs as execution layer agents
- **Vibe Coding**: Natural language → DSPy signatures → compiled programs
- **Parallel Execution**: Ray for GEPA optimization across multiple programs

### With Apollo Dagger MCP
- **Container Operations**: Use Apollo MCP for CI/CD infrastructure
- **Program Deployment**: Dagger containers host FastAPI services serving DSPy programs
- **No GraphQL**: Direct HTTP API exposure of program objects

### Zero-Entropy Principle
All production DSPy deployments converge to:
1. **Compiled programs** as deployment units
2. **FastAPI/MLflow** as serving layer
3. **Async execution** for scale
4. **Versioned artifacts** for rollback

## Key Success Patterns

### Program-Centric Philosophy
- DSPy programs are the deployment unit, not containers or schemas
- Compilation and optimization happen offline
- Serving is just loading and calling optimized program objects

### Black-Box Modularity
- Swap infrastructure components without touching program logic
- Clear separation between program optimization and deployment concerns
- Environment-driven configuration keeps programs pure

### Operational Excellence
- Version control through MLflow model registry
- Caching at multiple layers (Redis, diskcache)
- Comprehensive observability (Prometheus, OpenTelemetry, Sentry)
- Background processing for expensive operations

## Related Frameworks & Concepts

### Core DSPy Documentation
- [[DSPy - Programming Not Prompting Language Models]] - Main framework overview
- [[DSPy - Omar Khattab Research Journey and Advanced Concepts]] - Research philosophy
- [[DSPy - Practical Workflow Guide]] - Implementation patterns
- [[DSPy - Language Model Framework]] - Knowledge base entry
- [[DSPy GEPA Listwise Reranker Optimization]] - Advanced optimization
- [[DSPy Blue Ocean Strategy Analysis]] - Market positioning

### Production Integration
- [[Apollo Dagger MCP Integration]] - Container orchestration for CI/CD
- [[Automagik Hive Architecture]] - Multi-agent orchestration patterns
- [[Runestone - LLM Gateway]] - Multi-provider routing

### Deployment Patterns
- [[FastAPI]] - Web framework for serving DSPy programs
- [[MLflow]] - Model versioning and deployment
- [[Redis]] - Caching and session management
- [[Prometheus]] - Monitoring and alerting

---

*This stack represents the convergent evolution of DSPy production deployments. The libraries above are the minimal sufficient set for robust, scalable DSPy program serving.*