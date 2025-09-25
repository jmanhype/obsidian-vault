# DSPy GEPA Listwise Reranker Optimization

#dspy #gepa #optimization #reranking #pareto-frontier #natural-language-feedback

## The Breakthrough

Weave8 team achieved **32% → 45% recall@1** improvement using DSPy's GEPA optimizer on a listwise reranker with only **500 metric calls** in 1.5 hours.

## Core Innovation: Pareto Frontier Optimization

**"Each prompt candidate survives by excelling at something specific."**

### Traditional Optimization
- Single best prompt for all samples
- Hill climbing on aggregate score
- Loses diversity in exploration

### GEPA Approach
- Maintains population of prompts
- Each prompt on frontier is best at ≥1 sample
- Preserves diversity through specialization

Example:
- Prompt A: Succeeds on sample 1, fails on 2,3
- Prompt B: Succeeds on samples 2,3, fails on 1
- Both survive on the Pareto frontier

## Natural Language Feedback Revolution

**"Gradients are numbers. Feedback is understanding."**

### Traditional Metrics
```python
def metric(prediction, ground_truth):
    return 0.0  # Just a number
```

### GEPA Metrics
```python
def metric(prediction, ground_truth):
    if correct:
        return 1.0, "Awesome! Correctly predicted top document."
    else:
        return 0.0, f"Incorrect. Expected {ground_truth}, got {prediction}"
        # Optimizer can now UNDERSTAND the failure mode
```

## The Hard Examples Principle

**Discovery: GEPA works better on HARD training examples**

They filtered Enron QA dataset to only include questions where:
- Recall@5 ✓ (relevant doc in top 5)
- Recall@1 ✗ (not in top 1)
- State-of-the-art cross-encoders fail

**Why hard examples work:**
- Forces semantic understanding
- Can't memorize patterns
- Must learn true principles
- Aligns with Pareto frontier diversity

## Critical Hyperparameters

### 1. Validation Set Size (Most Important)
- **Too Large**: Every prompt lands on frontier (uninformative)
- **Too Small**: Not representative
- **Sweet Spot**: 20-50 samples for diversity without dilution

### 2. Reflection Model
- Use most capable model (GPT-5 with 32k tokens)
- Temperature 1.0 for creative mutations
- This model proposes prompt mutations

### 3. Mini-batch Size
- How many samples for each mutation proposal
- Smaller = more focused mutations
- Larger = more generalizable mutations

## The Architecture

```
Initial Prompt (2000 tokens!)
    ↓
Population of Candidates
    ↓
Evaluate on Validation Set
    ↓
Construct Pareto Frontier
    ↓
Sample from Frontier
    ↓
Mutate with Natural Language Feedback
    ↓
Merge Promising Lineages
    ↓
Repeat
```

## Key Metrics to Monitor

### 1. Best Validation Aggregate Score
- Overall performance across all samples
- Can plateau while exploration continues

### 2. Pareto Frontier Aggregate Score
- Theoretical max if you had oracle selection
- If improving → optimization has potential
- Gap to best score = generalization challenge

### 3. Frontier Diversity
- Which prompts survive on which samples
- High diversity = healthy exploration

## The Prompt Evolution

### Initial Prompt (Simple)
```
Identify the single most relevant passage to the query.
```

### Optimized Prompt (2000 tokens!)
- Multiple rules and heuristics
- Edge case handling
- Specific relevance criteria
- Learned from failure patterns

## Connection to Our Vault Patterns

### Pareto Frontier ↔ Selective Attention
- Different prompts = different attention patterns
- Survival through specialization
- Diversity preserves capability

### Natural Language Feedback ↔ Semantic Control
- Language feedback > numeric gradients
- Semantic understanding of failures
- Mutation guided by meaning, not math

### Hard Examples ↔ Compression Principle
- Difficulty forces compression to essentials
- Can't rely on spurious patterns
- Must find true semantic core

### Population Evolution ↔ CORAL Collaboration
- Multiple agents (prompts) with specializations
- Knowledge sharing through merging
- Collective intelligence emergence

## Practical Implementation Tips

1. **Start with Hard Examples**
   - Filter dataset for failures of existing systems
   - Focus on the improvement gap

2. **Monitor Pareto Frontier**
   - If frontier improving but aggregate flat → keep going
   - Exploration phase before convergence

3. **Copy Logs to LLM**
   - Paste optimization logs into Gemini/Claude
   - Ask "How is my optimization run going?"
   - Meta-optimization loop!

4. **Expect Long Prompts**
   - Optimized prompts often 1000-2000 tokens
   - Complexity emerges from evolution
   - Still shorter than few-shot examples

## The Zero-Entropy Insight

**"Specialization enables generalization."**

The Pareto frontier proves:
- No single solution dominates all cases
- Diversity is essential for robustness
- Evolution requires variation
- The best generalist emerges from specialists

## Future Directions

1. **Rationale Integration**
   - Use Chain-of-Thought rationale in feedback
   - Deeper semantic understanding

2. **Longer Runs**
   - 500 calls → 45% improvement
   - What about 5000? 50,000?

3. **Frontier Size Control**
   - Separate frontier set from validation
   - Dynamic frontier pruning

## Implementation Code Structure

```python
# 1. Define DSPy Program
class BestMatchReranker(dspy.Module):
    def __init__(self):
        self.rerank = dspy.ChainOfThought(signature)
    
    def forward(self, query, candidates):
        # Reranking logic
        return best_match

# 2. Metric with Feedback
def recall_metric_with_feedback(prediction, ground_truth):
    if prediction == ground_truth:
        return 1.0, "Correctly identified!"
    return 0.0, f"Wrong: expected {ground_truth}, got {prediction}"

# 3. Run GEPA
optimizer = GEPA(
    metric=recall_metric_with_feedback,
    max_metric_calls=500,
    validation_set_size=38,  # Critical parameter
    reflection_llm=gpt5_32k
)

optimized_program = optimizer.compile(
    program=BestMatchReranker(),
    trainset=hard_examples  # Use difficult samples!
)
```

## The Deeper Pattern

GEPA reveals the same pattern we see everywhere:

**"Evolution requires diversity, selection, and semantic understanding."**

- **Diversity**: Pareto frontier maintains variation
- **Selection**: Natural language feedback guides evolution  
- **Understanding**: Semantic feedback > numeric gradients

This is biological evolution with semantic selection pressure.

## Related Frameworks & Concepts

### Core DSPy Documentation
- [[DSPy - Programming Not Prompting Language Models]] - Main framework overview
- [[DSPy - Omar Khattab Research Journey and Advanced Concepts]] - Theory behind DSPy
- [[DSPy - Practical Workflow Guide]] - Implementation patterns
- [[DSPy - Language Model Framework]] - Knowledge base entry
- [[DSPy Blue Ocean Strategy Analysis]] - Market positioning

### Optimization Techniques
- [[RLHF]] - Reinforcement learning concepts
- [[Few-Shot Learning]] - Alternative to GEPA's approach
- [[Genetic Algorithms]] - Foundation for GEPA
- [[Pareto Optimization]] - Core GEPA concept
- [[Multi-Objective Optimization]] - Related optimization theory
- [[Natural Selection Patterns]] - Evolutionary principles

### Related Patterns in Vault
- [[CORAL Pattern]] - Multi-agent specialization (similar to Pareto frontier)
- [[Selective Attention]] - Different prompts = different attention
- [[Compression Principle]] - Hard examples force essential learning
- [[Multi-Agent Convergence]] - Population evolution dynamics
- [[Agent-Tool Convergence]] - Specialization enables generalization

### Reranking & Retrieval
- [[ColBERT]] - Omar's retrieval model
- [[RAG (Retrieval Augmented Generation)]] - Common use case
- [[Cross-Encoders]] - What GEPA outperformed
- [[BM25]] - Traditional reranking baseline
- [[Dense Retrieval]] - Modern retrieval approaches

### Should Document
- **MIPRO** - Another DSPy optimizer
- **GRPO** - Gradient-based DSPy optimization
- **SIMBA** - Reflective prompt evolution
- **Enron QA Dataset** - Dataset used in experiments
- **Listwise Reranking** - The specific task GEPA excelled at
- **Weave8** - Team that achieved the breakthrough

---
*"In the frontier lies the future."*