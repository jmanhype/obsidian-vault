# DSPy Practical Workflow Guide

> A hands-on guide for implementing DSPy in real-world projects, from initial setup to production deployment.

## Quick Start Checklist

- [ ] Install DSPy: `pip install dspy-ai`
- [ ] Set up LM provider (OpenAI/Anthropic/Local)
- [ ] Start with single-line signature
- [ ] Run and observe behavior
- [ ] Build evaluation examples from failures
- [ ] Expand only when necessary
- [ ] Consider optimization after 100+ examples

## Development Workflow

### Phase 1: Discovery & Prototyping

#### 1.1 Start Minimal
```python
import dspy

# Configure your LM
lm = dspy.OpenAI(model="gpt-3.5-turbo")
dspy.settings.configure(lm=lm)

# Start with the simplest possible program
qa = dspy.ChainOfThought("question -> answer")

# Test immediately
result = qa(question="What is DSPy?")
print(result.answer)
```

#### 1.2 Observe & Document Failures
```python
# Create a simple test harness
test_cases = [
    {"question": "What is DSPy?", "expected_contains": "programming"},
    {"question": "How does ColBERT work?", "expected_contains": "retrieval"},
]

failures = []
for case in test_cases:
    result = qa(question=case["question"])
    if case["expected_contains"] not in result.answer.lower():
        failures.append({
            "input": case["question"],
            "output": result.answer,
            "expected": case["expected_contains"]
        })
```

### Phase 2: Specification & Structure

#### 2.1 Expand to Signature Class
```python
class QASignature(dspy.Signature):
    """Answer questions accurately and concisely.
    
    Provide clear, factual responses with appropriate context.
    If uncertain, acknowledge limitations.
    """
    
    question: str = dspy.InputField(
        desc="The question to be answered"
    )
    
    # Add optional context field
    context: Optional[str] = dspy.InputField(
        desc="Relevant background information",
        default=""
    )
    
    answer: str = dspy.OutputField(
        desc="Clear, accurate answer to the question"
    )

# Create module with expanded signature
qa_module = dspy.ChainOfThought(QASignature)
```

#### 2.2 Add Tools & Retrieval
```python
# Add retrieval for knowledge-intensive tasks
class RAGSignature(dspy.Signature):
    """Answer questions using retrieved context."""
    
    question: str = dspy.InputField()
    context: List[str] = dspy.InputField(desc="Retrieved passages")
    answer: str = dspy.OutputField()

class RAGModule(dspy.Module):
    def __init__(self, retriever):
        super().__init__()
        self.retriever = retriever
        self.answer = dspy.ChainOfThought(RAGSignature)
    
    def forward(self, question):
        # Retrieve relevant context
        passages = self.retriever(question, k=3)
        
        # Generate answer with context
        result = self.answer(
            question=question,
            context=passages
        )
        return result
```

### Phase 3: Evaluation & Iteration

#### 3.1 Build Evaluation Dataset
```python
# Accumulate from real usage
eval_dataset = []

# From failures
for failure in failures:
    eval_dataset.append({
        "question": failure["input"],
        "gold_answer": failure["expected"],  # Or full answer
    })

# From successful runs (with verification)
successful_examples = [
    {
        "question": "Explain DSPy modules",
        "gold_answer": "DSPy modules are composable units..."
    }
]

eval_dataset.extend(successful_examples)
```

#### 3.2 Define Metrics
```python
def accuracy_metric(example, prediction):
    """Check if prediction contains key information."""
    # Simple containment check
    return example.gold_answer.lower() in prediction.answer.lower()

def quality_metric(example, prediction):
    """More sophisticated evaluation."""
    # Could use another LM as judge
    judge = dspy.ChainOfThought("question, answer, expected -> score")
    result = judge(
        question=example.question,
        answer=prediction.answer,
        expected=example.gold_answer
    )
    return float(result.score) > 0.7
```

### Phase 4: Optimization (When Needed)

#### 4.1 Check If Optimization Helps
```python
# Only optimize if you have enough data
if len(eval_dataset) >= 50:
    from dspy.teleprompt import BootstrapFewShot
    
    # Simple few-shot optimizer
    optimizer = BootstrapFewShot(
        metric=accuracy_metric,
        max_bootstrapped_demos=3
    )
    
    # Compile the program
    optimized_qa = optimizer.compile(
        qa_module,
        trainset=eval_dataset[:30],  # Use part for training
    )
    
    # Evaluate improvement
    baseline_score = evaluate(qa_module, eval_dataset[30:])
    optimized_score = evaluate(optimized_qa, eval_dataset[30:])
    
    if optimized_score > baseline_score + 0.05:  # 5% improvement
        qa_module = optimized_qa
```

#### 4.2 Advanced Optimization
```python
from dspy.teleprompt import MIPROv2

# For complex multi-module systems
class ComplexSystem(dspy.Module):
    def __init__(self):
        self.understanding = dspy.ChainOfThought("input -> analysis")
        self.reasoning = dspy.ChainOfThought("analysis -> solution")
        self.generation = dspy.ChainOfThought("solution -> output")
    
    def forward(self, input):
        analysis = self.understanding(input=input)
        solution = self.reasoning(analysis=analysis.analysis)
        output = self.generation(solution=solution.solution)
        return output

# Optimize entire pipeline
optimizer = MIPROv2(
    metric=quality_metric,
    prompt_model=lm,  # Model for generating prompts
    num_candidates=10,  # Prompt candidates to try
)

optimized_system = optimizer.compile(
    ComplexSystem(),
    trainset=eval_dataset,
    num_trials=20,  # Optimization iterations
)
```

### Phase 5: Production Deployment

#### 5.1 Model Selection Strategy
```python
# Test smaller models with optimization
models_to_test = [
    ("gpt-3.5-turbo", None),  # Baseline
    ("gpt-4", None),  # Expensive baseline
    ("llama-2-13b", BootstrapFewShot),  # Small + optimization
    ("t5-large", MIPROv2),  # Tiny + heavy optimization
]

results = {}
for model_name, optimizer_class in models_to_test:
    lm = load_model(model_name)
    dspy.settings.configure(lm=lm)
    
    program = ComplexSystem()
    
    if optimizer_class:
        optimizer = optimizer_class(metric=quality_metric)
        program = optimizer.compile(program, trainset=eval_dataset)
    
    score = evaluate(program, test_dataset)
    cost = estimate_cost(model_name, test_dataset)
    
    results[model_name] = {
        "score": score,
        "cost": cost,
        "value": score / cost  # Performance per dollar
    }
```

#### 5.2 Save & Load Compiled Programs
```python
# Save optimized program
optimized_system.save("optimized_qa_v1.json")

# Load in production
production_qa = ComplexSystem()
production_qa.load("optimized_qa_v1.json")
```

## Common Patterns

### Pattern 1: Agent → Workflow Evolution
```python
# Start with flexible agent
agent = dspy.ReAct("question -> answer", tools=[search, calculator])

# After understanding patterns, crystallize to workflow
class StructuredWorkflow(dspy.Module):
    def __init__(self):
        self.search = search_tool
        self.calc = calculator_tool
        self.synthesize = dspy.ChainOfThought("facts -> answer")
    
    def forward(self, question):
        # Now with explicit order
        facts = self.search(question)
        if needs_calculation(question):
            calc_result = self.calc(extract_math(question))
            facts.append(calc_result)
        return self.synthesize(facts=facts)
```

### Pattern 2: Graceful Degradation
```python
class RobustQA(dspy.Module):
    def __init__(self):
        self.primary = dspy.ChainOfThought("question -> answer")
        self.fallback = dspy.Predict("question -> answer")
    
    def forward(self, question):
        try:
            # Try sophisticated approach
            result = self.primary(question=question)
            if self.validate(result):
                return result
        except Exception:
            pass
        
        # Fallback to simpler approach
        return self.fallback(question=question)
```

### Pattern 3: Multi-Stage Reasoning
```python
class MultiStageReasoner(dspy.Module):
    def __init__(self):
        # Break complex reasoning into stages
        self.decompose = dspy.ChainOfThought(
            "complex_question -> subquestions"
        )
        self.solve = dspy.ChainOfThought(
            "subquestion -> subanswer"
        )
        self.combine = dspy.ChainOfThought(
            "subanswers -> final_answer"
        )
    
    def forward(self, question):
        # Decompose
        subqs = self.decompose(complex_question=question)
        
        # Solve each
        subanswers = []
        for subq in subqs.subquestions:
            answer = self.solve(subquestion=subq)
            subanswers.append(answer.subanswer)
        
        # Combine
        return self.combine(subanswers=subanswers)
```

## Debugging & Troubleshooting

### Enable Inspection
```python
# See what's actually being sent to the LM
dspy.settings.configure(trace=[])  # Collect traces

result = qa_module(question="test")

# Inspect the trace
for entry in dspy.settings.trace:
    print("Prompt:", entry.get("prompt"))
    print("Response:", entry.get("response"))
    print("-" * 40)
```

### Common Issues & Solutions

#### Issue: Poor Performance Without Clear Pattern
```python
# Add logging to understand failures
class DebuggingModule(dspy.Module):
    def forward(self, **kwargs):
        result = super().forward(**kwargs)
        
        # Log intermediate values
        print(f"Input: {kwargs}")
        print(f"Output: {result}")
        
        # Check for common issues
        if not result or len(str(result)) < 10:
            print("WARNING: Short/empty output")
        
        return result
```

#### Issue: Optimization Not Helping
```python
# Check data quality
def analyze_dataset(dataset):
    # Diversity check
    unique_patterns = len(set(ex.question[:20] for ex in dataset))
    print(f"Pattern diversity: {unique_patterns}/{len(dataset)}")
    
    # Label consistency
    duplicates = find_duplicates(dataset)
    print(f"Duplicate questions: {len(duplicates)}")
    
    # Difficulty distribution
    difficulties = [assess_difficulty(ex) for ex in dataset]
    print(f"Difficulty range: {min(difficulties)}-{max(difficulties)}")
```

## Production Checklist

### Pre-Deployment
- [ ] Evaluation metrics defined and tested
- [ ] Baseline performance established
- [ ] Optimization attempted (if applicable)
- [ ] Model/cost tradeoffs evaluated
- [ ] Edge cases documented
- [ ] Fallback strategies implemented

### Deployment
- [ ] Programs saved/versioned
- [ ] Monitoring configured
- [ ] A/B testing setup (if applicable)
- [ ] Rollback plan prepared
- [ ] Performance benchmarks set

### Post-Deployment
- [ ] Collect production examples
- [ ] Monitor performance metrics
- [ ] Build new evaluation sets
- [ ] Schedule reoptimization
- [ ] Document learned patterns

## Best Practices

### Do's ✅
- Start with simplest possible program
- Build evaluation data from real usage
- Use type hints and descriptions
- Test multiple models before optimizing
- Version your compiled programs
- Monitor production performance

### Don'ts ❌
- Don't optimize without eval data
- Don't add complexity prematurely
- Don't couple prompts to code logic
- Don't ignore failed examples
- Don't skip baseline measurements
- Don't over-engineer initial versions

## Quick Reference

### Essential Imports
```python
import dspy
from dspy.teleprompt import BootstrapFewShot, MIPROv2
from dspy.evaluate import Evaluate
```

### Basic Program Structure
```python
# 1. Configure LM
dspy.settings.configure(lm=your_lm)

# 2. Define signature
class YourSignature(dspy.Signature):
    """Your task description"""
    input: str = dspy.InputField()
    output: str = dspy.OutputField()

# 3. Create module
module = dspy.ChainOfThought(YourSignature)

# 4. Use it
result = module(input="your input")

# 5. Optimize (optional)
optimizer = BootstrapFewShot(metric=your_metric)
optimized = optimizer.compile(module, trainset=data)
```

---

## Related Frameworks & Concepts

### In Vault
- [[DSPy - Programming Not Prompting Language Models]] - Core framework philosophy
- [[DSPy - Omar Khattab Research Journey and Advanced Concepts]] - Theory and research
- [[LangChain]] - Compare workflow differences
- [[Semantic Kernel]] - Alternative orchestration approach
- [[Prompt Engineering Best Practices]] - What DSPy automates
- [[RAG (Retrieval Augmented Generation)]] - Common DSPy use case
- [[Agent Workflows]] - DSPy ReAct patterns
- [[Evaluation Metrics]] - Critical for DSPy optimization
- [[Model Fine-Tuning]] - Alternative to DSPy compilation
- [[Few-Shot Learning]] - Core to DSPy optimizers

### Practical Tools (Should Document)
- **DSPy-UI** - Visual interface for DSPy programs
- **DSPy-Serve** - Production deployment framework
- **LangSmith** - Could track DSPy experiments
- **Phoenix** - Observability for DSPy pipelines
- **Evidently AI** - Model monitoring for DSPy
- **Great Expectations** - Data validation for DSPy inputs
- **Streamlit/Gradio** - Quick DSPy demos
- **FastAPI** - Serving DSPy programs
- **Ray Serve** - Scalable DSPy deployment

### Workflow Patterns
- **Iteration-First Development** - Core DSPy philosophy
- **Error-Driven Development** - Build evals from failures
- **Progressive Enhancement** - Start simple, add complexity
- **Compilation-Time Optimization** - Not runtime prompting
- **Model-Agnostic Design** - Write once, run anywhere

### Production Considerations
- **A/B Testing** - Compare compiled programs
- **Model Migration** - Recompile for new models
- **Cost Optimization** - Small model + optimizer vs large model
- **Latency Requirements** - Cache compiled programs
- **Monitoring & Observability** - Track optimizer performance

### Common Integration Points
- **Vector Databases** - Pinecone, Weaviate, Qdrant for RAG
- **Document Loaders** - Unstructured, LlamaParse
- **Embedding Models** - OpenAI, Cohere, local models
- **Deployment Platforms** - Modal, Replicate, Hugging Face
- **MLOps Tools** - DVC, ClearML, Neptune

---

*Tags: #DSPy #Workflow #Tutorial #BestPractices #Production*