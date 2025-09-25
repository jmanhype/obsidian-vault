# Claude Flow v2.0.0 - Complete Command Reference

## Overview
Claude Flow v2.0.0-alpha.86 is an Enterprise-Grade AI Agent Orchestration Platform with complete ruv-swarm integration, 90+ MCP tools, neural networking, and production-ready infrastructure.

## Installation & Setup

### Quick Start
```bash
# First time setup (creates CLAUDE.md & .claude/commands)
npx claude-flow@alpha init

# Interactive Hive Mind setup wizard (RECOMMENDED)
npx claude-flow@alpha hive-mind wizard

# Create intelligent swarm with objective
npx claude-flow@alpha hive-mind spawn "Build API"

# Open with Claude Code CLI integration
npx claude-flow@alpha hive-mind spawn "Build API" --claude
```

### After Local Install
```bash
# Commands available without npx
claude-flow start --ui --swarm         # Start with swarm intelligence UI
claude-flow swarm "build REST API"     # Deploy multi-agent workflow
claude-flow swarm "create service" --claude  # Open Claude Code CLI with swarm
```

## Core Commands

### Hive Mind Commands
```bash
# Hive Mind System Management
claude-flow hive-mind wizard         # Interactive setup wizard (RECOMMENDED)
claude-flow hive-mind init           # Initialize Hive Mind system with SQLite
claude-flow hive-mind spawn <task>   # Create intelligent swarm with objective
claude-flow hive-mind status         # View active swarms and performance metrics
claude-flow hive-mind metrics        # Advanced performance analytics
claude-flow hive-mind resume <id>    # Resume a paused hive mind session
claude-flow hive-mind stop           # Stop a running hive mind session
claude-flow hive-mind sessions       # List all hive mind sessions
claude-flow hive-mind consensus      # View consensus decisions
claude-flow hive-mind memory         # Manage collective memory

# Hive Mind Options
--queen-type <type>    # Queen coordinator type (strategic, tactical, adaptive)
--max-workers <n>      # Maximum worker agents (default: 8)
--consensus <type>     # Consensus algorithm (majority, weighted, byzantine)
--memory-size <mb>     # Collective memory size in MB (default: 100)
--auto-scale           # Enable auto-scaling based on workload
--encryption           # Enable encrypted communication
--monitor              # Real-time monitoring dashboard
--verbose              # Detailed logging
--claude               # Generate Claude Code spawn commands with coordination
--auto-spawn           # Automatically spawn Claude Code instances
--execute              # Execute Claude Code spawn commands immediately
```

### Swarm Intelligence Commands
```bash
# Deploy Multi-Agent Swarms
claude-flow swarm <objective> [options]

# Swarm Options
--strategy <type>    # research, development, analysis, testing, optimization, maintenance
--mode <type>        # centralized, distributed, hierarchical, mesh, hybrid
--max-agents <n>     # Maximum number of agents (default: 5)
--parallel           # Enable parallel execution (2.8-4.4x speed improvement)
--monitor            # Real-time swarm monitoring
--ui                 # Interactive user interface
--background         # Run in background with progress tracking
--claude             # Open Claude Code CLI
--executor           # Use built-in executor instead of Claude Code
--analysis           # Enable analysis/read-only mode (no code changes)
--read-only          # Enable read-only mode (alias for --analysis)

# Examples
claude-flow swarm "Build a REST API with authentication"
claude-flow swarm "Research cloud architecture patterns" --strategy research
claude-flow swarm "Optimize database queries" --max-agents 3 --parallel
claude-flow swarm "Analyze codebase for security issues" --analysis
```

### Agent Management
```bash
# Agent Commands
claude-flow agent spawn                 # Create a new agent
claude-flow agent list                  # List all active agents
claude-flow agent info <id>             # Show agent details
claude-flow agent terminate <id>        # Stop an agent
claude-flow agent hierarchy             # Manage agent hierarchies
claude-flow agent ecosystem             # View agent ecosystem

# Agent Options
--type <type>        # coordinator, researcher, coder, analyst, architect, tester, reviewer, optimizer
--name <name>        # Agent name
--verbose            # Detailed output
--json               # Output in JSON format

# Examples
claude-flow agent spawn researcher --name "Research Bot"
claude-flow agent list --json
claude-flow agent terminate agent-123
```

### SPARC Development Modes
```bash
# SPARC Commands
claude-flow sparc spec          # Specification mode - Requirements analysis
claude-flow sparc architect     # Architecture mode - System design
claude-flow sparc tdd           # Test-driven development mode
claude-flow sparc integration   # Integration mode - Component connection
claude-flow sparc refactor      # Refactoring mode - Code improvement
claude-flow sparc modes         # List all available SPARC modes

# SPARC Options
--file <path>        # Input/output file path
--format <type>      # Output format (markdown, json, yaml)
--verbose            # Detailed output

# Examples
claude-flow sparc spec "User authentication system"
claude-flow sparc tdd "Payment processing module"
claude-flow sparc architect "Microservices architecture"
```

### Memory Operations
```bash
# Memory Commands
claude-flow memory store <key> <value>  # Store data in memory
claude-flow memory query <pattern>      # Search memory by pattern
claude-flow memory list                 # List memory namespaces
claude-flow memory export <file>        # Export memory to file
claude-flow memory import <file>        # Import memory from file
claude-flow memory clear                # Clear memory namespace

# Memory Options
--namespace <name>   # Memory namespace [default: default]
--ttl <seconds>      # Time to live in seconds
--format <type>      # Export format (json, yaml)

# Examples
claude-flow memory store "api_design" "REST endpoints specification"
claude-flow memory query "authentication"
claude-flow memory export backup.json
```

### GitHub Integration
```bash
# GitHub Modes
claude-flow github init                  # Initialize GitHub-enhanced checkpoint system
claude-flow github gh-coordinator        # GitHub workflow orchestration and CI/CD
claude-flow github pr-manager            # Pull request management with reviews
claude-flow github issue-tracker         # Issue management and project coordination
claude-flow github release-manager       # Release coordination and deployment
claude-flow github repo-architect        # Repository structure optimization
claude-flow github sync-coordinator      # Multi-package synchronization

# GitHub Options
--auto-approve       # Automatically approve safe changes
--dry-run            # Preview changes without applying
--verbose            # Detailed operation logging
--config <file>      # Custom configuration file

# Examples
claude-flow github pr-manager "create feature PR with tests"
claude-flow github gh-coordinator "setup CI/CD pipeline" --auto-approve
claude-flow github release-manager "prepare v2.0.0 release"
```

## Advanced Commands

### Training & Neural Learning
```bash
# Training Commands
claude-flow training neural-train       # Train neural patterns from operations data
claude-flow training pattern-learn      # Learn from specific operation outcomes
claude-flow training model-update       # Update agent models with new insights

# Neural Train Options
--data <source>      # recent, historical, custom, swarm-<id>
--model <name>       # task-predictor, agent-selector, performance-optimizer
--epochs <n>         # Training epochs (default: 50)

# Pattern Learn Options
--operation <op>     # Operation type to learn from
--outcome <result>   # success/failure/partial

# Model Update Options
--agent-type <type>  # Agent type to update
--operation-result <res>  # Result from operation execution

# Examples
claude-flow training neural-train --data recent --model task-predictor
claude-flow training pattern-learn --operation "file-creation" --outcome "success"
claude-flow training model-update --agent-type coordinator --operation-result "efficient"
```

### Coordination & Orchestration
```bash
# Coordination Commands
claude-flow coordination swarm-init      # Initialize swarm coordination infrastructure
claude-flow coordination agent-spawn     # Spawn and coordinate new agents
claude-flow coordination task-orchestrate # Orchestrate task execution across agents

# Swarm Init Options
--swarm-id <id>      # Swarm identifier (auto-generated if not provided)
--topology <type>    # hierarchical, mesh, ring, star, hybrid
--max-agents <n>     # Maximum number of agents (default: 5)
--strategy <strategy> # Coordination strategy (default: balanced)

# Agent Spawn Options
--type <type>        # coordinator, coder, developer, researcher, analyst, etc.
--name <name>        # Custom agent name
--swarm-id <id>      # Target swarm for agent coordination
--capabilities <cap> # Custom capabilities specification

# Task Orchestrate Options
--task <description> # Task description (required)
--swarm-id <id>      # Target swarm for task execution
--strategy <strategy> # adaptive, parallel, sequential, hierarchical
--share-results      # Enable result sharing across swarm

# Examples
claude-flow coordination swarm-init --topology hierarchical --max-agents 8
claude-flow coordination agent-spawn --type developer --name "api-dev" --swarm-id swarm-123
claude-flow coordination task-orchestrate --task "Build REST API" --strategy parallel
```

### System Management
```bash
# Core System Commands
claude-flow init                 # Initialize Claude Flow v2.0.0
claude-flow start [--ui] [--swarm] # Start orchestration system
claude-flow status                # System status and health
claude-flow config <action>       # System configuration
claude-flow mcp <action>          # MCP server management
claude-flow batch <action>        # Batch operations
claude-flow stream-chain <workflow> # Stream-JSON chaining for multi-agent pipelines

# Additional Commands
claude-flow task <action>         # Task and workflow management
claude-flow analysis <command>    # Performance & token usage analytics
claude-flow automation <command>  # Intelligent agent & workflow management
claude-flow hooks <command>       # Lifecycle event management
claude-flow migrate-hooks         # Migrate settings.json to Claude Code 1.0.51+ format
claude-flow monitoring <command>  # Real-time system monitoring
claude-flow optimization <command> # Performance & topology optimization
```

## Agent Types & Capabilities

### Specialized Agent Roles
- **Coordinator**: Planning, delegating, orchestrating tasks
- **Researcher**: Information gathering and analysis with web access
- **Coder/Developer**: Code implementation and technical execution
- **Analyst/Analyzer**: Pattern identification and data insights
- **Architect**: System design and structural planning
- **Tester**: Quality assurance and validation
- **Reviewer**: Code and output evaluation
- **Optimizer**: Performance and efficiency improvements

### Agent Capabilities
- Task execution with neural pattern learning
- Collective memory sharing
- Consensus-based decision making
- Parallel processing with work stealing
- Real-time performance tracking
- Fault tolerance and self-healing
- Secure inter-agent communication

## Key Features

### Hive Mind Intelligence
- 🐝 Queen-led coordination with worker specialization
- 🧠 Collective memory and knowledge sharing
- 🤝 Consensus building for critical decisions
- ⚡ Parallel task execution with auto-scaling
- 🔄 Work stealing and load balancing
- 📊 Real-time metrics and performance tracking
- 🛡️ Fault tolerance and self-healing
- 🔒 Secure communication between agents

### Neural Learning
- Pattern recognition from agent behaviors
- Continuous model improvement
- Task prediction accuracy enhancement
- Performance optimization suggestions
- Error prevention pattern learning

### Analysis Mode
When using `--analysis` or `--read-only` flags, the swarm operates in safe read-only mode:
- Code reviews and security audits
- Architecture analysis and documentation
- Performance bottleneck identification
- Technical debt assessment
- Dependency mapping and analysis
- "What-if" scenario exploration

## Integration with Claude Code

### Claude Code CLI Integration
```bash
# Open Claude Code with swarm coordination
claude-flow hive-mind spawn "Build REST API" --claude

# Auto-spawn coordinated Claude Code instances
claude-flow hive-mind spawn "Research AI trends" --auto-spawn --verbose

# Execute Claude Code spawn commands immediately
claude-flow swarm "Create microservice" --claude --execute
```

### Claude Code 1.0.51+ Compatibility
- Full compatibility with enhanced hooks
- Batch processing support
- Settings.json migration support
- Stream-JSON chaining for multi-agent pipelines

## Documentation & Support

- 📚 Documentation: https://github.com/ruvnet/claude-flow
- 🐝 Hive Mind Guide: https://github.com/ruvnet/claude-flow/tree/main/docs/hive-mind
- 🐝 ruv-swarm: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm
- 💬 Discord Community: https://discord.agentics.org
- 💖 Created by rUv: https://github.com/ruvnet

## Related

### Vault Documentation
- [[Claude Flow Tmux Integration - Complete Swarm Automation]] - Tmux integration patterns
- [[Claude Code as Maestro - Orchestrating Claude Flow Swarms via Tmux]] - Maestro orchestration
- [[Claude Code 24-7 Automation with Tmux and Claude Flow]] - 24/7 automation guide
- [[Claude Flow - Neural Integration and Learning Patterns]] - Neural learning system
- [[Claude Flow - Code Archaeology Report]] - Detailed architecture analysis

### Implementation Examples
- [[Claude Flow Real-World Usage Patterns]] - Production usage examples
- [[DSPy Production Stack - Field-Tested Architecture Patterns]] - Production patterns
- [[Automagik Hive Architecture and Apollo MCP Synergy - Real Deal Implementation]] - Integration examples

### External Resources
- [npm Package](https://www.npmjs.com/package/claude-flow) - NPM package registry
- [MCP Specification](https://modelcontextprotocol.io/specification) - Protocol specification
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) - Official Claude Code docs
- [GitHub Actions Integration](https://github.com/marketplace/actions/claude-flow-ci) - CI/CD integration
- [Docker Hub](https://hub.docker.com/r/ruvnet/claude-flow) - Container images

### Related Technologies
- [WASM SIMD](https://webassembly.org/roadmap/) - WebAssembly SIMD for neural acceleration
- [SQLite](https://sqlite.org/docs.html) - Database for memory persistence
- [Socket.io](https://socket.io/docs/v4/) - Real-time communication layer
- [Node.js Clustering](https://nodejs.org/api/cluster.html) - Multi-process orchestration