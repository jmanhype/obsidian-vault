# Automagik Hive - Master Documentation

**Framework**: Production Multi-Agent Orchestration with Vibe Coding
**Repository**: https://github.com/namastexlabs/automagik-hive
**Version**: 0.1.10 (stable) | 0.2.0 (development)
**Creator**: Felipe Rosa (namastexlabs)
**Status**: 🚀 Production-ready with active enterprise deployments

## Executive Summary

Automagik Hive is a revolutionary multi-agent orchestration framework that transforms natural language instructions into production-ready AI systems. Through "vibe coding" - writing what you want in plain English - developers can spawn coordinated swarms of specialized AI agents that collaborate to solve complex problems.

## Core Innovation: Vibe Coding

```yaml
# Write vibes, get functionality
name: customer_support_agent
instructions: |
  You help customers with billing issues.
  You're empathetic but efficient.
  You escalate when needed.
```

This simple YAML becomes a fully functional agent through the framework's intelligent orchestration.

## Technical Architecture

### Three-Layer Coordination System

```
🧞 GENIE TEAM (Master Orchestrator)
    ├── Strategic coordination
    ├── Resource management
    └── Pattern learning
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

### Performance Metrics

- **Agent Instantiation**: 3 microseconds (Agno core)
- **Memory per Agent**: 6.5KB
- **Parallel Agents**: Unlimited
- **Pattern Retention**: 30 runs
- **Long-term Memory**: 180 days
- **SWE-Bench Performance**: 84.8% solve rate
- **Token Reduction**: 32.3% through smart decomposition
- **Speed Improvement**: 2.8-4.4x with parallelization

## Installation & Setup

### Zero-Install via UVX (Recommended)

```bash
# Initialize workspace with agent templates
uvx automagik-hive init my-project

# Start the server
uvx automagik-hive serve my-project

# Interactive chat
uvx automagik-hive chat my-project

# Validate agents
uvx automagik-hive validate my-project
```

### Development Installation

```bash
# Clone repository
git clone https://github.com/namastexlabs/automagik-hive
cd automagik-hive

# Install dependencies
make install

# Start development server
make dev

# Required: Set OpenAI API key for embeddings
export OPENAI_API_KEY="sk-..."
```

### Genie Mode (Enhanced Claude Code)

```bash
# Start Claude Code with Genie system prompt
uv run automagik-hive genie

# Use /wish command for natural language requests
/wish "Build a REST API with authentication"
```

## Project Structure

```
my-project/
├── .automagik-hive/
│   ├── agents/              # Agent definitions
│   │   ├── coordinator.yaml
│   │   ├── researcher.yaml
│   │   ├── code_writer.yaml
│   │   ├── debugger.yaml
│   │   ├── data_analyst.yaml
│   │   ├── project_manager.yaml
│   │   ├── report_writer.yaml
│   │   ├── reviewer.yaml
│   │   └── file_manager.yaml
│   └── config.yaml          # Server configuration
├── /genie/wishes/           # Wish fulfillment pipeline
│   └── feature-x.md         # ONE document per wish
│       ├── Requirements     # Initial wish
│       ├── TSD             # Technical Specification
│       ├── DDD             # Detailed Design Document
│       ├── Implementation  # Code references
│       └── DEATH TESTAMENT # Final structured report
└── .swarm/memory.db         # Persistent learning database
```

## Agent Templates

### Basic Agent Structure

```yaml
name: my_custom_agent
type: specialist  # optional: orchestrator, specialist, tool
model: gpt-4     # optional: specific model preference
instructions: |
  Define the agent's personality and capabilities here.
  Be specific about what it should and shouldn't do.
```

### Advanced Agent with Hooks

```yaml
name: tdd_enforcer
copilot_enabled: true
instructions: |
  You enforce test-driven development.
  You block file creation without tests.
  
capabilities:
  - Test validation
  - Coverage analysis
  - TDD enforcement

hooks:
  on_file_create: validate_tests_exist
  on_commit: check_coverage
  on_pr: enforce_standards

constraints:
  - Never allow untested code
  - Minimum 80% coverage
  - Tests must pass before implementation
```

## Behavioral Rules & Constraints

### Critical Behavioral Patterns

```python
# Anti-Agreement Protection
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

### Core Behavioral Rules

1. **NEVER estimate time** (no "6 weeks", "Week 1")
2. **NEVER create files unless necessary**
3. **ONE wish = ONE document** (no v2, v3 files)
4. **ALWAYS prefer editing over creating**
5. **ALWAYS parallelize when possible**
6. **ENFORCE boundaries** (testing agents can't edit code)

## Hooks System

### TDD Enforcement Hook Example

```python
# First hook implementation (Felipe's recent addition)
Error: {"reason": "RED PHASE VIOLATION: Creating implementation file 
     '/home/namastex/workspace/automagik-hive/should_fail.py' without 
     corresponding tests. Create tests first!"}
```

### Available Hooks

- **PreToolUse**: Validate before tool execution
- **PostToolUse**: Process after tool completion
- **on_task_start**: Initialize tracking
- **on_progress**: Stream updates
- **on_complete**: Finalize and report
- **on_file_create**: Enforce standards
- **on_commit**: Validate changes

## VSM Hierarchy Implementation

### S1-S5 Operational Layers

```
S5: Policy Layer (Constitutional Guard Rails)
    └── Ethical constraints and behavioral rules
S4: Intelligence Layer (MCP Discovery + Research)
    └── Pattern recognition and capability discovery
S3: Control Layer (Claude Flow Orchestration)
    └── Resource management and task routing
S2: Coordination Layer (MCP Message Passing)
    └── Agent conflict prevention
S1: Operations Layer (Claude Code Sub-agents)
    └── Actual coding, file ops, terminal work
```

## Integration Ecosystem

### CopilotKit Integration (v0.2.0 Development)

```tsx
// Real-time UI updates for agent operations
import { CopilotKit } from "@copilotkit/react-core";
import { AutomagikHiveOrchestrator } from "@automagik-hive/core";

export default function App() {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      agent="automagik-coordinator"
    >
      <AgentSwarmVisualizer />
      <TaskBreakdownPanel />
    </CopilotKit>
  );
}
```

### Automagik Forge Integration

```bash
# Kanban parallelization for Claude Code tasks
npx automagik-forge

# Features:
# - Visual task management
# - One-click PR creation
# - Parallel task execution
# - Progress tracking
```

### AGUI Integration

Native Agno UI support for visual agent management and monitoring.

## Production Deployments

### Success Stories

1. **Atena UI** (Universidade Cruzeiro do Sul)
   - Built in 8 hours using Hive + CopilotKit
   - Production deployment: https://atena-ui.vercel.app/
   - AI tutoring system for university students

2. **Enterprise Health Data Analysis**
   - Complete backend infrastructure in 15 minutes
   - 10 parallel agents coordinated
   - Professional quality maintained

3. **Legal Case Analysis System**
   - Multi-agent document processing
   - Parallel research and synthesis
   - Compliance-aware implementation

## Development Workflow

### Wish Fulfillment Pipeline

```
1. /wish command → Create wish document
2. hive-dev-planner → Generate TSD
3. hive-dev-designer → Create DDD  
4. hive-dev-coder → Implement
5. DEATH TESTAMENT → Final report
```

### Parallel Execution Framework

```python
# Decision Matrix
PARALLEL (Default):
  - Multiple files (3+)
  - Quality operations (ruff + mypy)
  - Independent components

SEQUENTIAL (Only when required):
  - TDD cycle (test → code → refactor)
  - Design dependencies (plan → design → implement)
```

## Memory & Learning System

### Persistent Learning Database

```
.swarm/memory.db
├── Pattern Recognition
├── Violation History
├── Success Metrics
├── Agent Performance
└── Domain Knowledge
```

### Behavioral Learning Archive

1. **Reflexive Agreement** (4 violations tracked)
2. **Time Estimation** (1 violation tracked)
3. **File Versioning** (2 violations tracked)
4. **Agent Boundaries** (5+ violations tracked)
5. **Routing Matrix** (Multiple violations tracked)

## Current Development Focus

### Active Work Areas (Felipe Rosa)

1. **UV/UVX Distribution Stabilization**
   - Ensuring consistent zero-install deployment
   - Package template resolution improvements

2. **Bug Fixes & Stability**
   - System described as "soooooo buggy"
   - Active debugging and stabilization

3. **Enterprise Features**
   - Production deployments with universities
   - Real-world testing and refinement

## Contributing

### How to Contribute

Felipe is actively seeking help with:

1. **Measurable PRs** - Concrete improvements to the codebase
2. **UV Run System** - Consistency improvements
3. **Bug Fixes** - Stabilization efforts
4. **Documentation** - Clarity and completeness

### Getting Started

```bash
# Fork and clone
git clone https://github.com/namastexlabs/automagik-hive
cd automagik-hive

# Check out dev branch
git checkout dev

# Install and test
make install
make dev

# Create feature branch
git checkout -b feature/your-improvement

# Make changes and test
# Submit PR with clear description
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Templates not found | Upgrade to v0.1.10+ |
| Server won't start | Check port 8000 availability |
| Agents not responding | Verify API keys are set |
| YAML errors | Run `uvx automagik-hive validate` |
| UV distribution issues | Use development installation |

## Zero-Entropy Insights

### Key Discoveries

1. **Hierarchical Reduction Is Universal**
   - All multi-agent systems converge to hierarchical orchestration
   - Strategic → Execution → Communication pattern emerges

2. **Behavioral Learning Is Critical**
   - Reflexive behaviors must be actively suppressed
   - Boundaries require constant enforcement
   - Patterns drift without explicit correction

3. **Vibe Coding Bridges Semantic Gap**
   - Natural language → YAML → Python progression
   - Lowers barrier to entry
   - Progressive complexity revelation

4. **Parallelization Is Natural State**
   - Sequential execution is the exception
   - Parallel-first reduces latency
   - Coordination overhead minimal

## Version History

- **0.1.10** (Dec 2024): Fixed UVX distribution with template inclusion ✅
- **0.1.9**: Initial public release
- **0.2.0** (In Development): CopilotKit integration, enhanced hooks

## Related Patterns & Laws

### Patterns
- [[Vibe Coding Pattern]] - Natural language to functional behavior
- [[Behavioral Vaccination Pattern]] - Pre-emptive constraint injection
- [[Multi-Agent Orchestration Pattern]] - Coordinated specialist agents
- [[Swarm Orchestration Pattern]] - Three-layer hierarchy
- [[Agent-Tool Convergence]] - Execution layer as tools

### Laws
- [[Law of Semantic Feedback]] - Natural language control effectiveness
- [[Law of Distribution Complexity]] - Easy local = hard global
- [[Law of Template Inclusion]] - Resources must be explicitly included

### Principles
- [[Zero-Install Distribution Principle]] - One command, no installation
- [[Orchestration Over Intelligence Principle]] - Multiple simple > one complex
- [[Pareto Frontier Evolution]] - Behavioral optimization

## Contact & Resources

- **Repository**: https://github.com/namastexlabs/automagik-hive
- **Lead Developer**: Felipe Rosa (namastexlabs)
- **Production Example**: https://atena-ui.vercel.app/
- **Alternative Fork**: https://github.com/namastex888/atena-hive/

---

*"Automagik Hive demonstrates that production multi-agent systems require strict behavioral boundaries, hierarchical orchestration, and continuous learning from violations"*

*Last Updated: 2025-01-28*