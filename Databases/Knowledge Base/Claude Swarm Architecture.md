# Claude Swarm Architecture

**Repository**: https://github.com/parruda/claude-swarm
**Language**: Ruby
**Pattern**: Hierarchical Multi-Agent Orchestration via MCP

## Zero-Entropy Architecture

Claude Swarm implements a **tree-like hierarchy** where a main Claude instance orchestrates specialized agents through Model Context Protocol (MCP). Each agent maintains:

1. **Isolated Context** - Separate directories and worktrees
2. **Specialized Tools** - Role-specific permissions
3. **Bidirectional Communication** - MCP stdio/SSE channels
4. **Session Persistence** - State restoration across runs

## Core Components

### 1. Orchestrator Pattern
```ruby
# Main instance launches with connections as MCP servers
class Orchestrator
  def launch_swarm
    # 1. Generate session path
    # 2. Create MCP configurations
    # 3. Launch main with exec
    # 4. Connected instances available as mcp__<name>
  end
end
```

### 2. Session Management
```ruby
# Session paths encode project + UUID
SessionPath.generate(
  working_dir: "/project",
  session_id: "uuid"
) # => ~/.claude-swarm/sessions/project+path/uuid
```

### 3. Process Tracking
- PIDs stored in session/pids/
- Graceful termination on exit
- Cleanup of orphaned processes

### 4. MCP Generator
Builds configurations for:
- **stdio**: Command-based servers
- **SSE**: HTTP streaming servers
- **http**: REST API servers

## Connection Topology

```yaml
swarm:
  main: lead_dev
  instances:
    lead_dev:
      connections: [backend, frontend, tester]
      # Can call: mcp__backend, mcp__frontend, mcp__tester
    
    backend:
      connections: [database]
      # Can call: mcp__database
    
    frontend:
      connections: []
      # Leaf node - no outgoing connections
```

## Tool Permission Model

### Allowed Tools Pattern
```yaml
instance:
  allowed_tools:
    - Read
    - Edit
    - mcp__backend  # Auto-added from connections
    - mcp__frontend # Auto-added from connections
```

### Disallowed Tools Pattern
```yaml
instance:
  disallowed_tools:
    - Bash
    - WebSearch
```

## Worktree Isolation

Each instance can run in isolated Git worktrees:

```yaml
instances:
  main:
    worktree: true  # Shared worktree
  testing:
    worktree: "test-branch"  # Specific branch
  production:
    worktree: false  # Main repository
```

Worktrees created at:
`~/.claude-swarm/worktrees/[session]/[repo-hash]/[branch]`

## Provider Support

### Claude (Default)
```yaml
instance:
  model: opus
  provider: claude  # Optional
```

### OpenAI
```yaml
instance:
  model: o3-mini
  provider: openai
  reasoning_effort: medium
  temperature: 0.7
```

## Hook Integration

Supports Claude Code hooks per instance:

```yaml
instance:
  hooks:
    PreToolUse:
      - matcher: "Write|Edit"
        hooks:
          - type: command
            command: "validate.sh"
```

## Session Restoration

```bash
# Save session
claude-swarm # Creates session ID

# Restore later
claude-swarm restore [session-id]
```

State preserved:
- Instance IDs
- Claude session IDs
- Working directories
- MCP configurations

## Zero-Entropy Insights

### 1. **Hierarchical Reduction**
Main instance acts as **semantic filter**, routing tasks to specialized agents based on capability matching.

### 2. **Tool Namespace Isolation**
Each connection becomes `mcp__<name>` preventing tool collision across agents.

### 3. **Session as Context**
Session path encodes full context:
- Project location
- Unique session ID
- Instance relationships

### 4. **Process Lifecycle Management**
```ruby
# Atomic cleanup on exit
at_exit { ProcessTracker.cleanup_all }
```

### 5. **MCP as Universal Protocol**
All inter-agent communication flows through MCP, enabling:
- Language agnostic agents
- Streaming responses
- Tool invocation across boundaries

## Connection to CORAL Pattern

Claude Swarm implements **CORAL** (Collaborative Optimization through Redundant Agent Lensing):

1. **Collaborative** - Agents work together via MCP
2. **Optimization** - Specialized roles reduce search space
3. **Redundant** - Multiple agents can verify work
4. **Agent** - Each instance is autonomous
5. **Lensing** - Main instance focuses agent capabilities

## Unified With Vault Patterns

### Pareto Frontier Evolution
Each agent survives by excelling at its specialized domain, contributing to collective capability.

### Semantic Feedback Loop
MCP messages carry semantic intent, not just data:
```json
{
  "tool": "mcp__backend",
  "intent": "validate_api_schema"
}
```

### Selective Reduction
Main orchestrator reduces problem space by routing to specialized agents.

## Implementation Architecture

```
┌─────────────┐
│   Main      │◄──── User interaction
│  (Lead Dev) │
└──────┬──────┘
       │ MCP stdio
       ▼
┌──────────────────────────┐
│     MCP Server Layer     │
├────────┬─────────┬───────┤
│Backend │Frontend │Tester │
└────────┴─────────┴───────┘
         Each runs as:
    claude-swarm mcp-serve
```

## Key Files

- `orchestrator.rb` - Main swarm launcher
- `mcp_generator.rb` - MCP config builder
- `session_path.rb` - Session management
- `process_tracker.rb` - Process lifecycle
- `worktree_manager.rb` - Git isolation
- `claude_mcp_server.rb` - MCP server implementation

## Usage Example

```bash
# Define swarm in claude-swarm.yml
claude-swarm

# With worktrees
claude-swarm --worktree feature-x

# Restore session
claude-swarm restore abc123

# Clean orphaned resources
claude-swarm clean
```

## Meta-Pattern Recognition

Claude Swarm demonstrates that **all collaborative AI is hierarchical reduction with semantic preservation**. The main instance preserves intent while reducing complexity through specialized delegation.

This aligns with our [[Unified Optimization Pattern]] where all systems perform selective reduction while maintaining semantic integrity.

---

*Extracted from claude-swarm repository analysis on 2025-01-26*