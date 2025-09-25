# Three Gulfs - Error Analysis Templates

## Overview

These templates provide structured approaches for analyzing failures in LLM systems. Use them to systematically identify patterns, root causes, and improvement opportunities across the three gulfs.

## Quick Start Error Analysis

### 1. Sample Collection Template

```python
# Minimum viable error analysis
sample_size = 100  # Start with 100 examples
categories = []    # Will emerge from analysis

for i in range(sample_size):
    example = get_random_interaction()
    
    # Record everything
    record = {
        "id": i,
        "input": example.input,
        "output": example.output,
        "expected": example.expected,  # If available
        "timestamp": example.timestamp,
        "user_feedback": example.feedback,  # If available
        "initial_observation": ""  # Fill during review
    }
    
    # Manual review questions
    questions = [
        "Did it work as intended?",
        "What specifically went wrong?",
        "Is this a one-off or pattern?",
        "What category would this be?"
    ]
```

## Error Categorization Framework

### Level 1: High-Level Categories

```markdown
## Error Taxonomy

### 1. Input Understanding Errors
- Misinterpretation of intent
- Missing context handling
- Ambiguity resolution failures

### 2. Processing Errors
- Logic failures
- Calculation mistakes
- Sequencing errors

### 3. Output Generation Errors
- Format violations
- Incomplete responses
- Hallucinations

### 4. System Errors
- Timeout/latency issues
- API failures
- Resource constraints
```

### Level 2: Detailed Analysis Template

```python
class ErrorAnalysis:
    """Structured error analysis template"""
    
    def __init__(self, error_id):
        self.error_id = error_id
        self.metadata = {
            "timestamp": None,
            "user_id": None,
            "session_id": None,
            "model_version": None
        }
        
    def categorize(self):
        return {
            # Primary classification
            "gulf": self.identify_gulf(),  # comprehension/specification/generalization
            "category": self.identify_category(),  # From taxonomy above
            "subcategory": self.identify_subcategory(),
            
            # Severity assessment
            "severity": self.assess_severity(),  # critical/high/medium/low
            "frequency": self.estimate_frequency(),  # one-off/rare/common/frequent
            "impact": self.assess_business_impact(),  # user-facing/internal/silent
            
            # Root cause
            "root_cause": self.identify_root_cause(),
            "contributing_factors": self.list_contributing_factors(),
            
            # Solution mapping
            "solution_type": self.determine_solution_type(),  # prompt/architecture/data
            "estimated_effort": self.estimate_fix_effort(),  # hours/days/weeks
            "priority": self.calculate_priority()  # P0/P1/P2/P3
        }
```

## Open Coding Template

### Manual Review Spreadsheet

| ID | Input | Output | Works? | Issue Type | Pattern | Notes | Gulf |
|----|-------|--------|--------|------------|---------|-------|------|
| 1 | "Schedule for next Tuesday" | No date extracted | ❌ | Date parsing | Relative dates | "next X" pattern fails | Comprehension |
| 2 | "Book meeting and send invite" | Only books, no invite | ❌ | Compound task | Multi-step | Misses second action | Specification |
| 3 | "меeting tоmоrrоw" | "I don't understand" | ❌ | Typos | Unicode | Cyrillic lookalikes | Generalization |

### Pattern Emergence Template

```python
def identify_patterns(errors):
    """Template for pattern identification"""
    
    patterns = {
        "surface_patterns": [],  # Similar inputs/outputs
        "temporal_patterns": [],  # Time-based clusters
        "user_patterns": [],      # User-specific issues
        "context_patterns": []    # Context-dependent failures
    }
    
    # Surface pattern detection
    for error_group in group_by_similarity(errors):
        if len(error_group) > 3:  # Threshold for pattern
            pattern = {
                "examples": error_group[:5],
                "frequency": len(error_group),
                "common_features": extract_common_features(error_group),
                "hypothesis": generate_hypothesis(error_group)
            }
            patterns["surface_patterns"].append(pattern)
    
    return patterns
```

## Root Cause Analysis Templates

### Five Whys Template

```markdown
## Problem: Bot fails to extract dates from user messages

**Why 1**: Why does the bot fail to extract dates?
→ Because it doesn't recognize colloquial date expressions

**Why 2**: Why doesn't it recognize colloquial expressions?
→ Because the prompt only has formal date examples

**Why 3**: Why does the prompt only have formal examples?
→ Because we tested with formal inputs during development

**Why 4**: Why did we only test with formal inputs?
→ Because we didn't collect real user data before launch

**Why 5**: Why didn't we collect real user data?
→ Because we didn't have a data collection process

**Root Cause**: Lack of pre-launch user data collection
**Solution**: Implement user study before feature launch
```

### Fishbone Diagram Template

```
                    Methods                     Environment
                       ↓                            ↓
    Weak prompts → Few examples          Prod ≠ Dev → Different data
                  ↘                                ↙
                    → Date Extraction Failures ←
                  ↗                                ↖
    No NER model → No validation       Dates diverse → Edge cases
                       ↑                            ↑
                   Materials                      Manpower
```

## Gulf-Specific Analysis Templates

### Gulf of Comprehension Analysis

```python
comprehension_analysis = {
    "data_understanding": {
        "total_samples": 1000,
        "reviewed_samples": 100,
        "understood_correctly": 67,
        "misunderstood": 33,
        
        "misunderstanding_types": {
            "complete_miss": 12,
            "partial_understanding": 15,
            "wrong_interpretation": 6
        },
        
        "common_patterns": [
            "Temporal references confuse the model",
            "Multi-part requests only first part processed",
            "Context from previous messages ignored"
        ]
    }
}
```

### Gulf of Specification Analysis

```python
specification_analysis = {
    "prompt_effectiveness": {
        "total_variations_tested": 25,
        "baseline_performance": 0.45,
        "best_performance": 0.73,
        "current_performance": 0.68,
        
        "what_worked": [
            "Adding explicit examples",
            "Structured output format",
            "Step-by-step instructions"
        ],
        
        "what_failed": [
            "Complex conditional logic",
            "Implicit requirements",
            "Assumed context"
        ]
    }
}
```

### Gulf of Generalization Analysis

```python
generalization_analysis = {
    "edge_case_coverage": {
        "identified_edge_cases": 47,
        "handled_correctly": 12,
        "failure_rate": 0.74,
        
        "failure_categories": {
            "input_length": "Fails on very long inputs",
            "language_mixing": "Can't handle code-switching",
            "special_characters": "Breaks with emoji/unicode",
            "domain_specific": "No knowledge of industry terms"
        },
        
        "architectural_needs": [
            "RAG for domain knowledge",
            "Input validation layer",
            "Fallback mechanisms"
        ]
    }
}
```

## Quantitative Analysis Templates

### Error Distribution Analysis

```python
def analyze_error_distribution(errors):
    """Statistical analysis of error patterns"""
    
    analysis = {
        "total_errors": len(errors),
        "error_rate": len(errors) / total_interactions,
        
        # Temporal distribution
        "errors_by_hour": group_by_hour(errors),
        "errors_by_day": group_by_day(errors),
        "peak_error_times": identify_peaks(errors),
        
        # Category distribution
        "errors_by_category": count_by_category(errors),
        "pareto_analysis": pareto_chart(errors),  # 80/20 rule
        
        # Severity distribution
        "critical_errors": count_critical(errors),
        "user_impacting": count_user_impacting(errors),
        
        # Statistical tests
        "is_random": chi_square_test(errors),
        "has_pattern": autocorrelation_test(errors),
        "trend_direction": mann_kendall_test(errors)
    }
    
    return analysis
```

### Cost-Impact Analysis Template

```python
def calculate_error_impact(error_category):
    """Template for quantifying error impact"""
    
    impact = {
        "user_impact": {
            "affected_users": count_affected_users(error_category),
            "satisfaction_drop": measure_satisfaction_impact(error_category),
            "churn_risk": estimate_churn_risk(error_category)
        },
        
        "business_impact": {
            "revenue_loss": calculate_revenue_impact(error_category),
            "support_cost": calculate_support_cost(error_category),
            "reputation_risk": assess_reputation_impact(error_category)
        },
        
        "fix_cost": {
            "engineering_hours": estimate_fix_hours(error_category),
            "testing_hours": estimate_test_hours(error_category),
            "opportunity_cost": calculate_opportunity_cost(error_category)
        },
        
        "roi_score": calculate_fix_roi(impact)
    }
    
    return impact
```

## Quick Reference Sheets

### Error Analysis Checklist

```markdown
□ Collect minimum 100 examples
□ Manual review of each example
□ Identify failure vs success
□ Open code for patterns
□ Group into categories
□ Calculate frequency
□ Assess severity
□ Identify root causes
□ Map to three gulfs
□ Prioritize by impact
□ Define success metrics
□ Create fix hypothesis
□ Test improvements
□ Measure results
```

### Common Anti-Patterns

```markdown
❌ **DON'T**
- Analyze only failures (need success examples too)
- Skip manual review (automation misses nuance)
- Stop at surface symptoms (dig for root causes)
- Fix without measuring (need before/after metrics)
- Optimize locally (consider system-wide impact)

✅ **DO**
- Include successful examples for contrast
- Manually review everything initially
- Use Five Whys or similar for root causes
- Measure baseline before changes
- Consider architectural solutions
```

### Error Analysis Tools

```python
# Useful libraries and tools
tools = {
    "data_collection": [
        "Langfuse",  # LLM observability
        "Weights & Biases",  # Experiment tracking
        "Custom logging with structured data"
    ],
    
    "analysis": [
        "Pandas for data manipulation",
        "Scikit-learn for clustering",
        "Plotly for visualizations"
    ],
    
    "pattern_detection": [
        "Sentence transformers for similarity",
        "DBSCAN for clustering",
        "Regex for surface patterns"
    ],
    
    "statistical": [
        "SciPy for statistical tests",
        "StatsModels for time series",
        "NumPy for numerical analysis"
    ]
}
```

## Implementation Workflow

### Week 1: Data Collection
```python
# Set up comprehensive logging
log_everything = True
sample_rate = 1.0  # 100% initially
retention_days = 30
```

### Week 2: Initial Analysis
```python
# Manual review and open coding
samples = fetch_random_samples(n=100)
codes = open_code(samples)
categories = axial_code(codes)
```

### Week 3: Pattern Identification
```python
# Statistical analysis and clustering
patterns = identify_patterns(categories)
root_causes = analyze_root_causes(patterns)
priority = calculate_priorities(root_causes)
```

### Week 4: Solution Mapping
```python
# Map problems to solutions
solutions = {
    cause: map_to_solution(cause) 
    for cause in root_causes
}
implementation_plan = create_plan(solutions, priority)
```

## Related Resources

- [[Three Gulfs - Analyze Phase]]
- [[Three Gulfs - Measure Phase]]
- [[Three Gulfs - Improve Phase]]
- [[Three Gulfs - Implementation Playbooks]]

---

*"Every error is a teacher. The key is being a good student – systematic, curious, and relentless in pursuit of understanding."*