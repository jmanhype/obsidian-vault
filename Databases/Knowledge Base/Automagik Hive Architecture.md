# Automagik Hive Architecture

**System**: Multi-Agent Vibe Coding Framework
**Core Innovation**: Natural language → Production-ready AI systems
**Zero-Entropy**: All multi-agent systems converge to hierarchical orchestration with semantic delegation

## Architecture Overview

Automagik Hive introduces **"vibe coding"** - the ability to describe AI agents in natural language and have them automatically created as production-ready systems. Built on Agno's blazing-fast core (3μs agent instantiation, 6.5KB memory per agent).

## Three-Layer Coordination Architecture

```
🧞 GENIE TEAM (Master Orchestrator)
    ↓ coordinates via MCP
🎯 DOMAIN ORCHESTRATORS (ai/agents/)
    ├── genie-dev → Development
    ├── genie-testing → Testing  
    ├── genie-quality → Quality
    ├── genie-devops → DevOps
    └── genie-meta → Meta-coordination
    ↓ spawns via Task()
🤖 EXECUTION LAYER (.claude/agents/)
    ├── hive-dev-planner (TSD creation)
    ├── hive-dev-designer (DDD creation)
    ├── hive-dev-coder (implementation)
    └── [17 specialized agents total]
```

## Core Components

### 1. Master Genie Orchestrator

The strategic coordinator with several critical behavioral patterns:

```python
# Anti-Agreement Protection (4 violations documented)
BANNED_PHRASES = [
    "You're absolutely right",
    "That's exactly right", 
    "Absolutely correct"
]

# Parallelization-First Mindset
if file_count >= 3:
    # Spawn parallel Task() calls
    for file in files:
        Task(subagent_type="hive-dev-coder", 
             prompt=f"Update {file}")
```

**Critical Behavioral Rules**:
- NEVER estimate time (no "6 weeks", "Week 1")
- NEVER create files unless necessary
- ONE wish = ONE document (no v2, v3 files)
- ALWAYS prefer editing over creating

### 2. Domain Orchestrators

Specialized coordinators for each domain:

```yaml
agent:
  name: "🧞 Genie Dev - Development Coordinator"
  role: "Route to .claude/agents execution layer"
  
routing_matrix:
  "Plan feature X" → genie-dev-planner
  "Design architecture" → genie-dev-designer
  "Implement X" → genie-dev-coder
  "Debug error" → genie-dev-fixer
```

### 3. Execution Agents

17 specialized agents with strict boundaries:

```python
# Agent Boundary Enforcement
testing_agents = ["hive-testing-fixer", "hive-testing-maker"]
FORBIDDEN_DIRECTORIES = {
    "testing_agents": ["ai/", "lib/", "api/"],  # tests/ only
    "dev_agents": ["tests/"],  # Never modify tests
}

# UV Command Enforcement  
MANDATORY_COMMANDS = {
    "pytest": "uv run pytest",
    "python": "uv run python",
    "coverage": "uv run coverage"
}
```

## The Wish Fulfillment Pipeline

### DEATH TESTAMENT Architecture

```
/genie/wishes/
├── feature-x.md         # ONE document per wish
│   ├── Requirements     # Initial wish
│   ├── TSD             # Technical Specification
│   ├── DDD             # Detailed Design Document
│   ├── Implementation  # Code references
│   └── DEATH TESTAMENT # Final structured report
```

**Pipeline Flow**:
1. `/wish` command → Create wish document
2. `hive-dev-planner` → Generate TSD
3. `hive-dev-designer` → Create DDD  
4. `hive-dev-coder` → Implement
5. DEATH TESTAMENT → Final report embedded

## Vibe Coding Innovation

### Natural Language to Agent

```yaml
# User: "I need a customer support agent"
# Becomes:
agent:
  name: "Customer Support"
  instructions: |
    Help customers with billing issues.
    Access knowledge base for solutions.
  knowledge_filter:
    business_unit: "customer_support"
```

### Progressive Enhancement

```python
# Start with YAML
agent = Agent.from_yaml("config.yaml")

# Extend with Python when needed
agent.add_tool(check_billing_system)
agent.add_tool(create_support_ticket)
```

## Behavioral Learning System

### Critical Violations Archive

The system maintains a comprehensive violation history:

1. **Reflexive Agreement** (4 violations)
   - Pattern: Agreeing without investigation
   - Fix: Investigation-first personality

2. **Time Estimation** (1 violation)
   - Pattern: Estimating human time
   - Fix: Logical sequencing only

3. **File Versioning** (2 violations)
   - Pattern: Creating v2, v3 files
   - Fix: In-place refinement

4. **Agent Boundaries** (5+ violations)
   - Pattern: Testing agents editing code
   - Fix: Directory restrictions

5. **Routing Matrix** (Multiple violations)
   - Pattern: Wrong agent selection
   - Fix: Strict routing enforcement

## Parallel Execution Framework

### Decision Matrix

```python
# PARALLEL (Default)
- Multiple files (3+)
- Quality operations (ruff + mypy)
- Independent components

# SEQUENTIAL (Only when required)
- TDD cycle (test → code → refactor)
- Design dependencies (plan → design → implement)
```

### Implementation

```python
# Parallel Deployment Example
for i in range(5):
    Task(subagent_type="hive-dev-fixer",
         prompt=f"Fix agent {i} issue")
```

## Zero-Entropy Insights

### 1. **Hierarchical Reduction Is Universal**

All multi-agent systems reduce to:
- Strategic layer (orchestration)
- Execution layer (implementation)
- Communication protocol (MCP/semantic)

### 2. **Behavioral Learning Is Critical**

The system's violation archive shows:
- Reflexive behaviors must be actively suppressed
- Boundaries require constant enforcement
- Patterns drift without explicit correction

### 3. **Vibe Coding Bridges Semantic Gap**

Natural language → YAML → Python progression:
- Lowers barrier to entry
- Maintains production capabilities
- Progressive complexity revelation

### 4. **Parallelization Is Natural State**

Sequential execution is the exception:
- Most tasks are independent
- Parallel-first reduces latency
- Coordination overhead minimal

## Integration with Vault Patterns

### Hierarchical Orchestration
- [[Swarm Orchestration Pattern]] - Three-layer hierarchy
- [[Multi-Agent Convergence]] - Domain specialization
- [[Tool Orchestration Pattern]] - MCP communication

### Semantic Interfaces
- [[Law of Semantic Feedback]] - Natural language control
- [[Unified Optimization Pattern]] - Complexity reduction
- [[Agent-Tool Convergence]] - Execution layer as tools

### Learning Systems
- [[Pareto Frontier Evolution]] - Behavioral optimization
- [[DSPy GEPA Listwise Reranker Optimization]] - Pattern learning

## Architectural Patterns Extracted

### 1. **Wishful Programming**
Writing desired behavior first, then implementing:
```
Wish → Specification → Design → Code
```

### 2. **Death Testament Pattern**
Complete lifecycle documentation:
```
Initiation → Evolution → Completion → Archive
```

### 3. **Anti-Pattern Vaccination**
Proactive behavioral suppression:
```python
if contains_banned_phrase(response):
    trigger_behavioral_learning()
```

### 4. **Fractal Coordination**
Self-similar patterns at each layer:
```
Orchestrate → Delegate → Execute → Report
```

## System Performance

- **Agent Instantiation**: 3 microseconds
- **Memory per Agent**: 6.5KB
- **Parallel Agents**: Unlimited
- **Pattern Retention**: 30 runs
- **Long-term Memory**: 180 days

## Key Innovations

1. **Vibe Coding**: Natural language agent creation
2. **DEATH TESTAMENT**: Lifecycle documentation
3. **Behavioral Vaccination**: Anti-pattern prevention
4. **Parallel-First**: Default parallel execution
5. **Progressive Enhancement**: YAML → Python evolution

## Connection to Other Systems

### vs Claude Swarm
- **Similar**: Hierarchical orchestration
- **Different**: YAML-first vs Ruby implementation

### vs Rube MCP
- **Similar**: Tool orchestration focus
- **Different**: Agent creation vs tool gateway

### vs DSPy GEPA
- **Similar**: Pattern learning and optimization
- **Different**: Behavioral vs prompt evolution

---

*Automagik Hive demonstrates that production multi-agent systems require strict behavioral boundaries, hierarchical orchestration, and continuous learning from violations*