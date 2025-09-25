# Three Gulfs - Tools and Templates Quick Reference

## Overview

Quick access to all tools, templates, code snippets, and resources for implementing the Three Gulfs Framework. Copy, paste, and customize for your needs.

## 🚀 Quick Start Templates

### Minimal Viable Analysis (1 Day)
```python
# Quick analysis template - start here!
import random
import json
from collections import Counter

# 1. Collect data
interactions = get_last_n_interactions(100)

# 2. Quick review
results = []
for i in interactions:
    results.append({
        "id": i.id,
        "worked": input("Did this work? (y/n/p): "),
        "issue": input("What went wrong? (or 'none'): "),
        "gulf": input("Gulf (c/s/g): ")  # comprehension/specification/generalization
    })

# 3. Summarize
issues = Counter([r["issue"] for r in results if r["issue"] != "none"])
print(f"Success rate: {len([r for r in results if r['worked'] == 'y']) / len(results):.1%}")
print(f"Top issues: {issues.most_common(5)}")
```

### Basic Error Logger
```python
# Add to your LLM calls immediately
def log_llm_interaction(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "input": args[0] if args else kwargs.get('prompt'),
                "output": result,
                "latency": time.time() - start,
                "status": "success"
            }
        except Exception as e:
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "input": args[0] if args else kwargs.get('prompt'),
                "error": str(e),
                "latency": time.time() - start,
                "status": "error"
            }
            raise
        finally:
            # Log to file for now, move to proper storage later
            with open('llm_logs.jsonl', 'a') as f:
                f.write(json.dumps(log_data) + '\n')
        return result
    return wrapper
```

## 📊 Analysis Templates

### Pattern Detection Template
```python
# Find patterns in failures
def quick_pattern_analysis(failures):
    patterns = {
        "length_related": [],
        "format_related": [],
        "content_type": [],
        "time_based": [],
        "user_specific": []
    }
    
    for failure in failures:
        # Length patterns
        if len(failure['input']) > 1000:
            patterns["length_related"].append(failure)
        
        # Format patterns
        if any(fmt in failure['input'] for fmt in ['json', 'xml', 'csv']):
            patterns["format_related"].append(failure)
        
        # Content patterns
        if any(word in failure['input'].lower() for word in ['calculate', 'math', 'number']):
            patterns["content_type"].append(failure)
    
    return {k: len(v) for k, v in patterns.items() if v}
```

### Root Cause Analysis Template
```markdown
## Five Whys Template

**Problem**: [Specific failure mode]

**Why 1**: Why does [problem] happen?
→ Answer: 

**Why 2**: Why does [answer 1] happen?
→ Answer:

**Why 3**: Why does [answer 2] happen?
→ Answer:

**Why 4**: Why does [answer 3] happen?
→ Answer:

**Why 5**: Why does [answer 4] happen?
→ Answer:

**Root Cause**: [Final answer]
**Solution**: [Proposed fix]
```

## 🔧 Gulf-Specific Solutions

### Gulf of Comprehension Solutions

#### Data Understanding Dashboard
```python
# Quick visibility into what's happening
def create_comprehension_dashboard():
    return {
        "daily_metrics": {
            "total_requests": count_daily_requests(),
            "unique_users": count_unique_users(),
            "success_rate": calculate_success_rate(),
            "error_rate": calculate_error_rate()
        },
        "top_failures": get_top_failures(n=10),
        "edge_cases": detect_edge_cases(),
        "trending_issues": detect_trending_issues()
    }
```

#### Sampling Strategy
```python
# Strategic sampling for manual review
def smart_sampling(all_interactions, n=100):
    samples = []
    
    # 40% random sample
    samples.extend(random.sample(all_interactions, int(n * 0.4)))
    
    # 30% recent failures
    recent_failures = [i for i in all_interactions[-1000:] if not i.success]
    samples.extend(random.sample(recent_failures, min(int(n * 0.3), len(recent_failures))))
    
    # 20% edge cases (very long, very short, special chars)
    edge_cases = [i for i in all_interactions if 
                  len(i.input) > 1000 or len(i.input) < 10 or 
                  any(c in i.input for c in '🔥😀<>{}[]')]
    samples.extend(random.sample(edge_cases, min(int(n * 0.2), len(edge_cases))))
    
    # 10% high-value users
    vip_interactions = [i for i in all_interactions if i.user_tier == 'premium']
    samples.extend(random.sample(vip_interactions, min(int(n * 0.1), len(vip_interactions))))
    
    return samples[:n]
```

### Gulf of Specification Solutions

#### Prompt Testing Framework
```python
# A/B test prompt variations
class PromptTester:
    def __init__(self):
        self.results = []
    
    def test_variation(self, base_prompt, variation_func, test_cases):
        variant = variation_func(base_prompt)
        
        scores = []
        for test in test_cases:
            output_base = llm(base_prompt, test.input)
            output_variant = llm(variant, test.input)
            
            score_base = evaluate(output_base, test.expected)
            score_variant = evaluate(output_variant, test.expected)
            
            scores.append({
                "base": score_base,
                "variant": score_variant,
                "improvement": score_variant - score_base
            })
        
        return {
            "avg_improvement": np.mean([s["improvement"] for s in scores]),
            "win_rate": len([s for s in scores if s["improvement"] > 0]) / len(scores),
            "significant": ttest_rel([s["base"] for s in scores], 
                                    [s["variant"] for s in scores]).pvalue < 0.05
        }

# Common variations to test
variations = {
    "add_examples": lambda p: p + "\n\nExamples:\n" + get_examples(),
    "add_structure": lambda p: f"<task>\n{p}\n</task>\n<format>JSON</format>",
    "add_cot": lambda p: p + "\n\nThink step by step:",
    "simplify": lambda p: simplify_language(p),
    "add_constraints": lambda p: p + "\n\nImportant: " + get_constraints()
}
```

#### Output Validation
```python
# Validate outputs match requirements
def validate_output(output, requirements):
    checks = {
        "format": check_format(output, requirements.format),
        "length": requirements.min_length <= len(output) <= requirements.max_length,
        "required_fields": all(field in output for field in requirements.fields),
        "no_hallucination": not contains_hallucination(output, context),
        "safety": is_safe(output)
    }
    
    return all(checks.values()), checks
```

### Gulf of Generalization Solutions

#### Simple RAG Implementation
```python
# Minimal RAG pipeline
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class SimpleRAG:
    def __init__(self, documents):
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.documents = documents
        self.embeddings = self.encoder.encode(documents)
        
        # Create FAISS index
        self.index = faiss.IndexFlatL2(self.embeddings.shape[1])
        self.index.add(self.embeddings.astype('float32'))
    
    def retrieve(self, query, k=5):
        query_embedding = self.encoder.encode([query])
        distances, indices = self.index.search(query_embedding.astype('float32'), k)
        
        return [self.documents[i] for i in indices[0]]
    
    def answer(self, question):
        # Retrieve relevant documents
        docs = self.retrieve(question)
        
        # Create context
        context = "\n\n".join(docs)
        
        # Generate answer
        prompt = f"""Answer based on the context below:
        
Context: {context}

Question: {question}

Answer:"""
        
        return llm(prompt)
```

#### Task Decomposition
```python
# Break complex tasks into steps
def decompose_task(complex_task):
    # Ask LLM to break down the task
    breakdown_prompt = f"""Break this task into smaller, independent steps:
    
Task: {complex_task}

Steps (numbered list):"""
    
    steps = llm(breakdown_prompt)
    
    # Execute each step
    results = []
    for step in parse_steps(steps):
        result = execute_simple_task(step)
        results.append(result)
    
    # Combine results
    synthesis_prompt = f"""Combine these results into a final answer:
    
Original task: {complex_task}

Step results:
{format_results(results)}

Final answer:"""
    
    return llm(synthesis_prompt)
```

#### Fallback Chain
```python
# Graceful degradation
class FallbackChain:
    def __init__(self):
        self.methods = [
            ("primary", self.primary_method, 0.9),  # (name, method, required_confidence)
            ("simplified", self.simplified_method, 0.7),
            ("rule_based", self.rule_based_method, 0.5),
            ("static", self.static_response, 0.0)
        ]
    
    def process(self, input_data):
        for name, method, min_confidence in self.methods:
            try:
                result = method(input_data)
                confidence = self.calculate_confidence(result)
                
                if confidence >= min_confidence:
                    return {
                        "result": result,
                        "method": name,
                        "confidence": confidence
                    }
            except Exception as e:
                continue
        
        return self.static_response(input_data)
```

## 📈 Measurement Tools

### LLM-as-Judge Template
```python
# Use LLM to evaluate outputs
def llm_judge(input_text, output_text, criteria):
    prompt = f"""You are an expert evaluator. Score this output based on the criteria.

Input: {input_text}
Output: {output_text}

Criteria: {criteria}

Scoring:
5 - Excellent, fully meets criteria
4 - Good, mostly meets criteria  
3 - Acceptable, partially meets criteria
2 - Poor, mostly fails criteria
1 - Unacceptable, completely fails criteria

Response format:
Score: [1-5]
Reasoning: [Brief explanation]
Evidence: [Specific examples]"""

    return parse_judge_response(llm(prompt))
```

### A/B Testing Framework
```python
# Simple A/B test implementation
class ABTest:
    def __init__(self, control, treatment):
        self.control = control
        self.treatment = treatment
        self.results = {"control": [], "treatment": []}
    
    def run(self, test_cases, split=0.5):
        for test in test_cases:
            if random.random() < split:
                result = self.control(test)
                self.results["control"].append(result)
            else:
                result = self.treatment(test)
                self.results["treatment"].append(result)
        
        return self.analyze()
    
    def analyze(self):
        from scipy import stats
        
        control_scores = [r.score for r in self.results["control"]]
        treatment_scores = [r.score for r in self.results["treatment"]]
        
        t_stat, p_value = stats.ttest_ind(control_scores, treatment_scores)
        
        return {
            "control_mean": np.mean(control_scores),
            "treatment_mean": np.mean(treatment_scores),
            "lift": (np.mean(treatment_scores) - np.mean(control_scores)) / np.mean(control_scores),
            "p_value": p_value,
            "significant": p_value < 0.05
        }
```

## 🛠️ Implementation Utilities

### Configuration Templates
```yaml
# config.yaml - System configuration
llm:
  model: gpt-4
  temperature: 0.7
  max_tokens: 1000
  timeout: 30

evaluation:
  sample_rate: 0.1  # Evaluate 10% of interactions
  human_review_rate: 0.01  # Human review 1%
  alert_threshold: 0.8  # Alert if success < 80%

logging:
  level: INFO
  retain_days: 30
  sensitive_data: redact

deployment:
  canary_percentage: 5
  rollback_threshold: 0.7
  health_check_interval: 60
```

### Monitoring Dashboard
```python
# Real-time monitoring setup
def setup_monitoring():
    metrics = {
        "counters": [
            "requests_total",
            "errors_total", 
            "fallbacks_triggered"
        ],
        "gauges": [
            "success_rate",
            "average_latency",
            "active_users"
        ],
        "histograms": [
            "request_duration",
            "token_usage",
            "confidence_scores"
        ]
    }
    
    alerts = [
        Alert("High Error Rate", "error_rate > 0.1", "pagerduty"),
        Alert("Slow Response", "p95_latency > 5000", "slack"),
        Alert("Low Confidence", "avg_confidence < 0.7", "email")
    ]
    
    dashboard = {
        "widgets": [
            LineChart("Success Rate", "success_rate", "1h"),
            Histogram("Latency Distribution", "request_duration", "5m"),
            Table("Recent Errors", "errors_total", limit=10),
            PieChart("Error Categories", "error_by_type")
        ]
    }
    
    return metrics, alerts, dashboard
```

## 📋 Checklists

### Pre-Launch Checklist
```markdown
□ Logging implemented for all LLM calls
□ Error handling and fallbacks in place
□ Evaluation metrics defined
□ Baseline performance measured
□ A/B testing framework ready
□ Monitoring dashboards configured
□ Alert rules defined
□ Rollback plan documented
□ Team trained on framework
□ Initial 100 interactions reviewed
```

### Daily Operations Checklist
```markdown
□ Review error rate trends
□ Check for new failure patterns
□ Sample 10 interactions for quality
□ Review any triggered alerts
□ Update documentation if needed
□ Share findings with team
```

### Weekly Review Checklist
```markdown
□ Analyze week's performance metrics
□ Identify top 3 issues to fix
□ Review A/B test results
□ Update error taxonomy
□ Plan next week's improvements
□ Document lessons learned
```

## 🔗 Quick Links

### Essential Libraries
```python
# pip install these
libraries = [
    "langchain",       # LLM orchestration
    "llama-index",     # Data framework
    "instructor",      # Structured outputs
    "ragas",          # RAG evaluation
    "langfuse",       # LLM observability
    "promptfoo",      # Prompt testing
    "sentence-transformers",  # Embeddings
    "faiss-cpu",      # Vector search
]
```

### Useful Resources
- [Three Gulfs Original Paper](https://arxiv.org/abs/2309.15337)
- [Hamel's Blog Posts](https://hamel.dev/)
- [Shreya's Substack](https://www.shreyashankar.com/)
- [LangChain Docs](https://python.langchain.com/)
- [OpenAI Cookbook](https://cookbook.openai.com/)

### Community & Support
- [LLM Ops Discord](https://discord.gg/llmops)
- [r/LocalLLaMA](https://reddit.com/r/LocalLLaMA)
- [Hugging Face Forums](https://discuss.huggingface.co/)

## 🎯 Quick Wins

### 5-Minute Improvements
1. Add logging to your LLM calls
2. Add output format validation
3. Add simple retry logic
4. Add timeout handling
5. Add error messages for users

### 1-Hour Improvements
1. Review 20 recent failures
2. Categorize into 3-5 buckets
3. Fix the most common issue
4. Add few-shot examples
5. Test on recent failures

### 1-Day Improvements
1. Implement basic RAG
2. Add A/B testing
3. Create evaluation dataset
4. Add monitoring dashboard
5. Document failure patterns

## Related Documents

- [[Three Gulfs Framework - Overview]]
- [[Three Gulfs - Error Analysis Templates]]
- [[Three Gulfs - Implementation Playbooks]]
- [[Three Gulfs - Real World Case Studies]]

---

*"The best tool is the one you actually use. Start simple, measure everything, iterate quickly."*