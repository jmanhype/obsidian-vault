# DSPy - Language Model Framework

**Type**: Language Model Programming Framework
**Origin**: Stanford NLP (2022-2024)
**Key Innovation**: Programming, not prompting - automatic prompt optimization through compilation

## Overview

DSPy (Declarative Self-improving Python) is a framework that transforms language model interaction from manual prompt engineering to systematic programming. Instead of crafting brittle prompts, developers write compositional Python code that DSPy compiles into optimized prompts, few-shot examples, or even fine-tuning weights.

## Core Philosophy

### The Paradigm Shift

```python
# Traditional Approach (Prompting)
prompt = "Given context: {context}\nQuestion: {question}\nAnswer:"
response = llm(prompt)  # Hope it works

# DSPy Approach (Programming)
class QA(dspy.Module):
    def __init__(self):
        self.generate_answer = dspy.ChainOfThought("context, question -> answer")
    
    def forward(self, context, question):
        return self.generate_answer(context=context, question=question)
```

DSPy treats prompts as optimizable parameters, not fixed strings.

## Three Core Abstractions

### 1. Signatures
Define input/output behavior declaratively:

```python
# Simple signature
"question -> answer"

# Complex signature with descriptions
class GenerateAnswer(dspy.Signature):
    """Answer questions with short factoid answers."""
    
    context = dspy.InputField(desc="may contain relevant facts")
    question = dspy.InputField()
    answer = dspy.OutputField(desc="often 1-5 words")
```

### 2. Modules
Replace hand-prompting with composable components:

```python
# Built-in modules
dspy.Predict      # Basic prediction
dspy.ChainOfThought  # Step-by-step reasoning
dspy.ProgramOfThought  # Code generation reasoning
dspy.ReAct        # Reasoning + Acting
dspy.Retrieve     # RAG retrieval

# Custom composition
class RAG(dspy.Module):
    def __init__(self, num_passages=3):
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate = dspy.ChainOfThought(GenerateAnswer)
    
    def forward(self, question):
        passages = self.retrieve(question).passages
        answer = self.generate(context=passages, question=question)
        return answer
```

### 3. Teleprompters (Optimizers)
Compile programs into optimized prompts:

```python
# Automatic prompt optimization
teleprompter = dspy.BootstrapFewShot(metric=my_metric)
compiled_rag = teleprompter.compile(RAG(), trainset=train_examples)

# The same program compiles differently for different LMs
gpt35_rag = compile_for(gpt35)
llama_rag = compile_for(llama2)
```

## Optimization Techniques

### Bootstrap Few-Shot
```python
# Automatically generate and select few-shot examples
bootstrap = dspy.BootstrapFewShot(
    max_bootstrapped_demos=4,
    max_labeled_demos=16,
    metric=exact_match
)
optimized = bootstrap.compile(program, trainset=data)
```

### MIPRO (Multi-prompt Instruction Proposal)
```python
# Optimize instructions and examples jointly
mipro = dspy.MIPRO(
    metric=accuracy,
    num_candidates=10,
    init_temperature=1.0
)
optimized = mipro.compile(program)
```

### Recent Optimizers (2024)

#### GRPO (Gradient-based Prompt Optimization)
```python
# RL-based optimization via Arbor library
grpo = dspy.GRPO(
    metric=task_metric,
    learning_rate=0.01
)
```

#### GEPA (Genetic Evolutionary Prompt Adaptation)
```python
# Evolutionary optimization
gepa = dspy.GEPA(
    population_size=50,
    generations=20,
    mutation_rate=0.1
)
```

#### SIMBA (Simplified Iterative Model-Based Adaptation)
```python
# Reflective prompt evolution
simba = dspy.SIMBA(
    iterations=10,
    reflection_depth=3
)
```

## Performance Advantages

### Automatic Optimization
- Outperforms human-written prompts
- Iterates and evaluates prompts systematically
- Adapts to different models automatically

### Model Agnostic
```python
# Same program, different models
for model in [gpt35, claude, llama, t5]:
    optimized = compile_for(model, program)
    # Each gets model-specific optimizations
```

### Small Model Competition
- 770M T5 models compete with GPT-3.5
- Llama2-13b matches larger proprietary models
- Optimization compensates for model size

## Integration Features (v3.0)

### Type System
```python
# Strong typing with dspy.Type
class FactualAnswer(dspy.Type):
    text: str
    confidence: float
    sources: List[str]
```

### Adapter Pattern
```python
# Custom model adapters
class CustomLM(dspy.Adapter):
    def __call__(self, prompt, **kwargs):
        return custom_api_call(prompt)
```

### MLflow Integration
```python
# Production observability
import mlflow.dspy

with mlflow.start_run():
    compiled = optimizer.compile(program)
    mlflow.dspy.log_model(compiled, "model")
```

## Real-World Applications

### RAG Pipelines
```python
class AdvancedRAG(dspy.Module):
    def __init__(self):
        self.retrieve = dspy.Retrieve(k=5)
        self.rerank = dspy.ChainOfThought("passages, query -> reranked")
        self.generate = dspy.ChainOfThought("context, question -> answer")
```

### Multi-Hop Reasoning
```python
class MultiHop(dspy.Module):
    def __init__(self, hops=3):
        self.hops = [dspy.ChainOfThought(f"hop{i}") for i in range(hops)]
```

### Agent Systems
```python
class Agent(dspy.Module):
    def __init__(self):
        self.think = dspy.ChainOfThought("observation -> thought")
        self.act = dspy.ReAct("thought -> action")
```

## Zero-Entropy Insights

### 1. **Prompts Are Parameters**
Not strings to craft, but parameters to optimize.

### 2. **Compilation > Configuration**
Programs compile to optimal configurations per model.

### 3. **Metrics Drive Evolution**
Define success, let DSPy find the path.

### 4. **Modularity Enables Complexity**
Simple modules compose into sophisticated systems.

## Best Practices

### 1. Start Simple
```python
# Begin with basic signatures
simple = dspy.Predict("input -> output")
```

### 2. Define Clear Metrics
```python
def my_metric(prediction, gold):
    return prediction.answer == gold.answer
```

### 3. Use Appropriate Optimizers
- **BootstrapFewShot**: When you have examples
- **MIPRO**: For instruction optimization
- **GRPO/GEPA**: For complex objectives

### 4. Iterate on Data
```python
# More/better data > more optimization
trainset = [dspy.Example(...) for _ in good_data]
```

## Related Frameworks & Concepts

### Core DSPy Documentation
- [[DSPy - Programming Not Prompting Language Models]] - Comprehensive framework overview
- [[DSPy - Omar Khattab Research Journey and Advanced Concepts]] - Research philosophy and advanced patterns
- [[DSPy - Practical Workflow Guide]] - Implementation patterns and best practices
- [[DSPy Blue Ocean Strategy Analysis]] - Market positioning analysis
- [[DSPy GEPA Listwise Reranker Optimization]] - Advanced optimization techniques

### Optimization & Learning
- [[GEPA - Genetic Evolutionary Prompt Adaptation]] - Evolutionary optimizer for DSPy
- [[RLHF]] - Reinforcement learning concepts used in GRPO
- [[Few-Shot Learning]] - Core to BootstrapFewShot
- [[Kernel Memory - In-Context Learning Framework]] - Related memory patterns
- [[xLSTM - Attention Mechanisms]] - Underlying attention concepts

### Alternative Approaches
- [[LangChain]] - Traditional prompt chaining (what DSPy replaces)
- [[Semantic Kernel]] - Microsoft's orchestration framework
- [[LangGraph]] - Graph-based LLM orchestration
- [[Instructor]] - Structured outputs (DSPy handles automatically)
- [[AutoGPT]] - Agent framework (can be improved with DSPy)

### Integration Points
- [[Apple MLX - Neural Network Framework]] - Potential DSPy backend
- [[Flask-SocketIO - Real-Time Web Framework]] - For serving DSPy apps
- [[ColBERT]] - Omar's retrieval model for RAG pipelines
- [[RAG (Retrieval Augmented Generation)]] - Common DSPy use case

### Should Document
- **Arbor** - RL library used by GRPO optimizer
- **SIMBA** - Reflective prompt evolution optimizer
- **DSPy-Serve** - Production deployment framework
- **DSPy-UI** - Visual interface for DSPy programs

---

*"DSPy: Where prompts become programs and optimization replaces engineering"*