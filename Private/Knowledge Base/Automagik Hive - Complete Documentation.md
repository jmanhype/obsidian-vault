# Automagik Hive - Complete Documentation

**Type**: Multi-Agent Orchestration Framework  
**Repository**: https://github.com/namastexlabs/automagik-hive  
**Version**: 0.1.10 (December 2024)  
**Status**: ✅ Fully Operational with UVX Distribution  
**Key Innovation**: Zero-install YAML-driven agent swarms

## Overview

Automagik Hive is a lightweight framework for creating swarms of autonomous AI agents that collaborate through YAML configuration. It pioneered "vibe coding" - writing natural language instructions that become functional agents.

## Core Architecture

### Three-Layer System

```
Layer 1: YAML Configuration (Human-readable)
           ↓
Layer 2: Agent Orchestration (Python/FastAPI)
           ↓
Layer 3: LLM Integration (OpenAI/Anthropic/Local)
```

### Vibe Coding Philosophy

```yaml
# Write vibes, get functionality
name: researcher
instructions: |
  You find information and validate sources.
  You're thorough but concise.
  You cite everything.
```

This natural language becomes a functional agent through the framework.

## Installation & Usage

### Zero-Install via UVX (Recommended)

```bash
# Initialize workspace with agent templates
uvx automagik-hive init my-project

# Start the server
uvx automagik-hive serve my-project

# Interactive chat
uvx automagik-hive chat my-project
```

### Traditional Installation

```bash
pip install automagik-hive
automagik-hive init my-project
```

## Project Structure

### Created by init Command

```
my-project/
└── .automagik-hive/
    └── agents/
        ├── coordinator.yaml      # Orchestrates other agents
        ├── researcher.yaml       # Information gathering
        ├── code_writer.yaml      # Code generation
        ├── debugger.yaml         # Error analysis
        ├── data_analyst.yaml     # Data processing
        ├── project_manager.yaml  # Task management
        ├── report_writer.yaml    # Documentation
        ├── reviewer.yaml         # Code review
        └── file_manager.yaml     # File operations
```

## Agent Templates

### 1. Coordinator Agent

```yaml
name: coordinator
instructions: |
  You are the orchestrator of our agent swarm.
  
  Your responsibilities:
  - Understand user objectives and break them into tasks
  - Delegate tasks to appropriate specialist agents
  - Monitor progress and ensure quality
  - Synthesize results from multiple agents
  - Present final outcomes to users
  
  Always:
  - Think step-by-step about complex problems
  - Match tasks to agent capabilities
  - Ensure clear communication between agents
  - Maintain focus on the user's goal
```

### 2. Researcher Agent

```yaml
name: researcher
instructions: |
  You are a research specialist.
  
  Your responsibilities:
  - Gather relevant information from various sources
  - Validate and fact-check information
  - Identify knowledge gaps
  - Provide comprehensive context
  - Summarize findings clearly
  
  Always:
  - Cite your sources
  - Distinguish between facts and opinions
  - Note confidence levels
  - Flag contradictory information
```

### 3. Code Writer Agent

```yaml
name: code_writer
instructions: |
  You are a code generation specialist.
  
  Your responsibilities:
  - Write clean, efficient, well-documented code
  - Follow language-specific best practices
  - Include error handling
  - Add comprehensive comments
  - Create modular, reusable components
  
  Always:
  - Ask for clarification on requirements
  - Consider edge cases
  - Write tests when appropriate
  - Follow existing code style
```

## Creating Custom Agents

### Basic Agent Structure

```yaml
name: my_custom_agent
type: specialist  # optional: orchestrator, specialist, tool
model: gpt-4     # optional: specific model preference
instructions: |
  Define the agent's personality and capabilities here.
  Be specific about what it should and shouldn't do.
```

### Advanced Agent Configuration

```yaml
name: api_integrator
instructions: |
  You integrate with external APIs and services.

capabilities:
  - REST API calls
  - GraphQL queries
  - Webhook handling
  - Authentication management

constraints:
  - Never expose API keys
  - Rate limit awareness
  - Retry with exponential backoff

model_preferences:
  primary: gpt-4
  fallback: gpt-3.5-turbo

temperature: 0.3  # Lower for more consistent behavior
max_tokens: 2000
```

## Server Architecture

### FastAPI Backend

```python
# Server runs on FastAPI with WebSocket support
# Handles agent communication via message passing

from fastapi import FastAPI, WebSocket
from automagik_hive.server import HiveServer

app = FastAPI()
server = HiveServer(workspace_path)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Handles real-time agent communication
    await server.handle_connection(websocket)
```

### Message Flow

```
User Request → Coordinator → Specialist Agents → Coordinator → Response
                    ↑              ↓                  ↑
                    └──────────────────────────────────┘
                         (Feedback/Clarification)
```

## Implementation Details

### Package Distribution Solution (v0.1.10)

The key innovation that enables zero-install distribution:

```python
def get_package_template_dir():
    """Smart template resolution with multiple fallbacks"""
    
    # Method 1: Modern Python (3.9+)
    try:
        import importlib.resources as resources
        template_dir = resources.files('automagik_hive').joinpath('templates_included/agents')
        if template_dir.exists():
            return template_dir
    except:
        pass
    
    # Method 2: Relative to package
    template_dir = Path(__file__).parent / 'templates_included' / 'agents'
    if template_dir.exists():
        return template_dir
    
    # Method 3: Development mode
    dev_dir = Path.cwd() / 'src' / 'automagik_hive' / 'templates_included' / 'agents'
    if dev_dir.exists():
        return dev_dir
    
    return None
```

### Critical pyproject.toml Configuration

```toml
[tool.setuptools.package-data]
automagik_hive = [
    "templates_included/**/*.yaml",  # Include all YAML templates
    "templates_included/**/*.yml"
]
```

## Related

### Patterns Discovered
- [[Vibe Coding Pattern]] - Natural language to functional behavior
- [[Behavioral Vaccination Pattern]] - Pre-emptive constraint injection
- [[Multi-Agent Orchestration Pattern]] - Coordinated specialist agents
- [[Template Embedding Pattern]] - Resources as code for distribution
- [[Zero-Configuration Pattern]] - Smart defaults over configuration

### Laws Validated
- [[Law of Template Inclusion]] - Resources must be explicitly included
- [[Law of Distribution Complexity]] - Easy local = hard global distribution
- [[Law of Silent Failures]] - Packages build without resources
- [[Law of Development-Production Disparity]] - Local success ≠ distribution success

### Principles Demonstrated
- [[Zero-Install Distribution Principle]] - One command, no installation
- [[Orchestration Over Intelligence Principle]] - Multiple simple > one complex
- [[Principle of Progressive Disclosure]] - Start simple, add complexity
- [[Principle of Instant Gratification]] - Immediate usability

### Technologies & Tools
- [[UV Package Management]] - Modern Python packaging with uvx
- [[FastAPI WebSocket Architecture]] - Real-time agent communication
- [[YAML Configuration]] - Human-readable agent definitions
- [[Setuptools Package Data]] - Resource inclusion in distributions

### Related Projects
- [[LangChain]] - LLM orchestration framework
- [[AutoGPT]] - Autonomous agent system
- [[CrewAI]] - Multi-agent collaboration
- [[Microsoft AutoGen]] - Multi-agent conversation framework

### Historical Context
- [[Python Packaging History]] - Evolution from distutils to modern tools
- [[Agent-Based Modeling]] - Academic foundation (1990s)
- [[Microservices Architecture]] - Architectural inspiration
- [[Unix Philosophy]] - Do one thing well

---
*"Automagik: Where natural language becomes swarm intelligence"*
EOF < /dev/null