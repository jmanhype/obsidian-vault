# Claude Code 24/7 Automation with Tmux and Claude Flow

## Overview
This document synthesizes real-world patterns for achieving continuous 24/7 Claude Code execution using tmux session management and Claude Flow orchestration. These patterns enable persistent, unattended AI agent workflows that survive disconnections and continue autonomous operation.

## Core Architecture: T-Max Orchestrator Pattern

### The Fundamental Problem
Claude Code sessions are inherently ephemeral - they terminate when the terminal closes, SSH disconnects, or the system reboots. For true 24/7 automation, we need persistent session management that survives these interruptions.

### The T-Max Solution
The T-Max Orchestrator pattern uses tmux as a persistent session layer, creating a "daemonized" Claude Code environment that runs continuously in the background.

```bash
# T-Max Session Creation Pattern
tmux new-session -d -s claude-main "claude --headless"
tmux new-session -d -s claude-worker-1 "claude --headless"
tmux new-session -d -s claude-worker-2 "claude --headless"
```

## Essential Tmux Commands for Claude Code

### Session Management
```bash
# Create detached Claude session
tmux new-session -d -s claude-prod "claude"

# Attach to running session
tmux attach -t claude-prod

# List all Claude sessions
tmux list-sessions | grep claude

# Kill specific session
tmux kill-session -t claude-prod

# Rename session for clarity
tmux rename-session -t 0 claude-main
```

### Window and Pane Management
```bash
# Create new window in session
tmux new-window -t claude-prod -n "worker"

# Split panes for monitoring
tmux split-window -h "htop"
tmux split-window -v "tail -f ~/.claude/logs/latest.log"

# Send commands to specific pane
tmux send-keys -t claude-prod:0.0 "task-master next" C-m
```

## Automation Patterns

### Pattern 1: Continuous Task Processing
```bash
#!/bin/bash
# claude-worker.sh - Continuous task processor

while true; do
    # Send task request to Claude
    tmux send-keys -t claude-worker "
    Please check for the next available task and complete it.
    Use task-master next to find work, then implement the solution.
    When done, mark the task complete and check for the next one.
    " C-m
    
    # Wait for task completion (adjust timing as needed)
    sleep 300  # 5 minutes per task cycle
done
```

### Pattern 2: Parallel Workflow Orchestration
```bash
#!/bin/bash
# parallel-claude.sh - Run multiple Claude instances

# Start coordinator
tmux new-session -d -s claude-coord "claude --mode coordinator"

# Start specialized workers
for i in {1..4}; do
    tmux new-session -d -s "claude-worker-$i" \
        "claude --mode worker --config worker-$i.json"
done

# Monitor all sessions
tmux new-window -n monitor
tmux send-keys "watch 'tmux list-sessions'" C-m
```

### Pattern 3: Scheduled Task Execution
```bash
#!/bin/bash
# scheduled-claude.sh - Cron-compatible scheduler

# Check if session exists, create if not
if ! tmux has-session -t claude-scheduler 2>/dev/null; then
    tmux new-session -d -s claude-scheduler "claude"
fi

# Send scheduled command
case "$1" in
    daily)
        tmux send-keys -t claude-scheduler \
            "Run daily maintenance tasks from .taskmaster/scheduled/daily.md" C-m
        ;;
    hourly)
        tmux send-keys -t claude-scheduler \
            "Check for and process any pending PR reviews" C-m
        ;;
    custom)
        tmux send-keys -t claude-scheduler "$2" C-m
        ;;
esac
```

### Pattern 4: Error Recovery and Restart
```bash
#!/bin/bash
# claude-guardian.sh - Monitor and restart failed sessions

while true; do
    # Check each Claude session
    for session in $(tmux list-sessions -F '#{session_name}' | grep claude); do
        # Check if session is responsive
        if ! tmux capture-pane -t "$session" -p | grep -q "Claude>"; then
            echo "Session $session appears frozen, restarting..."
            tmux kill-session -t "$session"
            tmux new-session -d -s "$session" "claude --resume"
        fi
    done
    
    sleep 60  # Check every minute
done
```

## Claude Flow Integration

### Dynamic Swarm Orchestration
```bash
# Initialize Claude Flow swarm in tmux
tmux new-session -d -s claude-swarm "
    claude --execute '
    Initialize a hierarchical swarm with:
    - 1 Queen coordinator
    - 2 Researcher agents  
    - 2 Coder agents
    - 1 Reviewer agent
    Then begin processing the task queue.
    '
"

# Monitor swarm status
tmux new-window -t claude-swarm -n monitor
tmux send-keys -t claude-swarm:monitor \
    "watch 'claude-flow hive-mind status --verbose'" C-m
```

### MCP Tool Automation
```bash
# Create specialized MCP tool sessions
tmux new-session -d -s claude-mcp-github \
    "claude --mcp github --auto-process-issues"

tmux new-session -d -s claude-mcp-browser \
    "claude --mcp browser --monitor-targets targets.json"

tmux new-session -d -s claude-mcp-taskmaster \
    "claude --mcp task-master --continuous"
```

## Advanced Patterns

### Pattern 5: Session State Preservation
```bash
#!/bin/bash
# preserve-state.sh - Save and restore Claude session state

# Save current state
tmux capture-pane -t claude-main -S -3000 > ~/.claude/sessions/main-$(date +%Y%m%d-%H%M%S).log

# Create state snapshot
claude --execute "
    Save current context to .claude/state/checkpoint-$(date +%Y%m%d-%H%M%S).json
    Include:
    - Current task progress
    - Open files and cursor positions
    - Variable states
    - Partial implementations
"

# Restore on restart
tmux new-session -d -s claude-restored \
    "claude --restore-from .claude/state/latest-checkpoint.json"
```

### Pattern 6: Inter-Session Communication
```bash
#!/bin/bash
# claude-ipc.sh - Inter-process communication between Claude sessions

# Create named pipe for communication
mkfifo /tmp/claude-pipe

# Reader session
tmux new-session -d -s claude-reader "
    while true; do
        if read line < /tmp/claude-pipe; then
            claude --execute \"Process message: \$line\"
        fi
    done
"

# Writer session can send commands
echo "New high-priority task: Fix critical bug in auth.js" > /tmp/claude-pipe
```

### Pattern 7: Load Balancing
```bash
#!/bin/bash
# load-balancer.sh - Distribute tasks across Claude workers

get_least_busy_session() {
    local min_tasks=999
    local best_session=""
    
    for session in $(tmux list-sessions -F '#{session_name}' | grep claude-worker); do
        # Get task count from session (simplified)
        task_count=$(tmux capture-pane -t "$session" -p | grep -c "in-progress")
        
        if [ "$task_count" -lt "$min_tasks" ]; then
            min_tasks=$task_count
            best_session=$session
        fi
    done
    
    echo "$best_session"
}

# Assign new task to least busy worker
target=$(get_least_busy_session)
tmux send-keys -t "$target" "task-master next && implement solution" C-m
```

## Configuration Management

### Tmux Configuration for Claude
```tmux
# ~/.tmux.claude.conf

# Set scrollback buffer for Claude output
set-option -g history-limit 50000

# Enable mouse support for easier navigation
set -g mouse on

# Custom status bar for Claude sessions
set -g status-right '#[fg=yellow]Claude: #{session_name} #[fg=green]Tasks: #{pane_current_command}'

# Key bindings for Claude operations
bind-key C new-session -s claude-new "claude"
bind-key T send-keys "task-master next" C-m
bind-key S send-keys "task-master status" C-m

# Window naming
set-option -g automatic-rename on
set-option -g automatic-rename-format '#{pane_current_command}'

# Pane borders for clarity
set -g pane-border-style fg=magenta
set -g pane-active-border-style fg=cyan

# Activity monitoring
setw -g monitor-activity on
set -g visual-activity on
```

### Environment Setup
```bash
# ~/.claude-tmux-env

# Claude-specific environment variables
export CLAUDE_SESSION_TIMEOUT=0  # Disable timeout
export CLAUDE_AUTO_RESUME=true
export CLAUDE_HEADLESS=true
export CLAUDE_LOG_LEVEL=info

# MCP configurations
export MCP_TASK_MASTER_AUTO=true
export MCP_SWARM_PERSISTENT=true
export MCP_MEMORY_CACHE=/tmp/claude-cache

# Tmux settings
export TMUX_TMPDIR=/tmp/tmux-claude
mkdir -p $TMUX_TMPDIR
```

## Monitoring and Logging

### Comprehensive Logging Setup
```bash
#!/bin/bash
# setup-logging.sh

# Create log directory structure
mkdir -p ~/.claude/logs/{sessions,tasks,errors,performance}

# Start logging session
tmux pipe-pane -t claude-main -o \
    'cat >> ~/.claude/logs/sessions/main-$(date +%Y%m%d).log'

# Error monitoring
tmux new-window -n errors \
    "tail -f ~/.claude/logs/errors/*.log | grep ERROR"

# Performance tracking
tmux new-window -n perf \
    "watch 'claude-flow hive-mind metrics'"
```

### Health Monitoring Dashboard
```bash
#!/bin/bash
# claude-dashboard.sh

tmux new-session -d -s claude-monitor

# Split into monitoring panes
tmux split-window -h -p 50
tmux split-window -v -p 50
tmux select-pane -t 0
tmux split-window -v -p 50

# Pane 0: Active sessions
tmux send-keys -t claude-monitor:0.0 \
    "watch 'tmux list-sessions | grep claude'" C-m

# Pane 1: Task status
tmux send-keys -t claude-monitor:0.1 \
    "watch 'task-master list --status=in-progress'" C-m

# Pane 2: Resource usage
tmux send-keys -t claude-monitor:0.2 \
    "htop -F claude" C-m

# Pane 3: Log tail
tmux send-keys -t claude-monitor:0.3 \
    "tail -f ~/.claude/logs/latest.log" C-m
```

## Best Practices

### 1. Session Naming Convention
```bash
claude-main          # Primary coordinator
claude-worker-{n}    # Worker instances
claude-spec-{type}   # Specialized agents (claude-spec-tester)
claude-mcp-{tool}    # MCP tool sessions
claude-temp-{id}     # Temporary sessions
```

### 2. Resource Management
- Limit concurrent Claude sessions based on system resources
- Use `nice` and `ionice` for background processing
- Implement memory monitoring and cleanup routines
- Set CPU affinity for critical sessions

### 3. Error Handling
- Always wrap Claude commands in error checking
- Implement automatic restart mechanisms
- Log all errors with context
- Set up alerting for critical failures

### 4. Security Considerations
- Use separate tmux sockets for different security contexts
- Implement session access controls
- Rotate logs and clean sensitive data
- Use encrypted communication for distributed setups

### 5. Backup and Recovery
- Regular state snapshots
- Session recording for audit trails
- Automated backup of task progress
- Disaster recovery procedures

## Integration with CI/CD

### GitHub Actions Integration
```yaml
name: Claude Tmux Automation

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  claude-tasks:
    runs-on: self-hosted
    steps:
      - name: Ensure Claude Session
        run: |
          if ! tmux has-session -t claude-ci 2>/dev/null; then
            tmux new-session -d -s claude-ci "claude --headless"
          fi
      
      - name: Execute Claude Task
        run: |
          tmux send-keys -t claude-ci "
            Check for pending CI tasks and process them.
            Update task status in GitHub.
          " C-m
      
      - name: Capture Results
        run: |
          sleep 60  # Wait for completion
          tmux capture-pane -t claude-ci -p > results.log
          cat results.log
```

## Troubleshooting

### Common Issues and Solutions

1. **Session Disconnection**
   - Use `tmux attach` to reconnect
   - Check `~/.tmux/resurrect/` for saved sessions
   - Implement auto-reconnect scripts

2. **Memory Leaks**
   - Monitor with `ps aux | grep claude`
   - Implement periodic session restarts
   - Use memory limits in tmux

3. **Frozen Sessions**
   - Send interrupt: `tmux send-keys -t session C-c`
   - Force kill: `tmux kill-session -t session`
   - Check logs for deadlock conditions

4. **Performance Degradation**
   - Limit scrollback buffer size
   - Rotate logs regularly
   - Use separate tmux servers for isolation

## Conclusion

The combination of tmux session management with Claude Flow's orchestration capabilities enables robust 24/7 automation of Claude Code workflows. These patterns provide:

1. **Persistence**: Sessions survive disconnections and system events
2. **Parallelism**: Multiple Claude instances working simultaneously
3. **Reliability**: Automatic error recovery and restart mechanisms
4. **Observability**: Comprehensive monitoring and logging
5. **Scalability**: Distributed processing across multiple sessions

This architecture forms the foundation for building production-grade autonomous AI agent systems that can operate continuously without human intervention, processing tasks, responding to events, and maintaining system health around the clock.

## Related

### Vault Documentation
- [[Claude Flow Tmux Integration - Complete Swarm Automation]] - Deep dive into Claude Flow swarm operations with tmux
- [[Claude Code as Maestro - Orchestrating Claude Flow Swarms via Tmux]] - Maestro pattern for meta-orchestration
- [[Claude Flow v2.0.0 - Complete Command Reference]] - Comprehensive command documentation
- [[Claude Flow - Neural Integration and Learning Patterns]] - Neural learning system architecture
- [[DSPy Production Stack - Field-Tested Architecture Patterns]] - Related production patterns
- [[Automagik Hive Architecture and Apollo MCP Synergy - Real Deal Implementation]] - Complementary swarm architectures

### External Resources
- [Claude Flow GitHub Repository](https://github.com/ruvnet/claude-flow) - Official source code and documentation
- [ruv-swarm Integration](https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm) - Neural networking and WASM SIMD acceleration
- [Tmux Documentation](https://github.com/tmux/tmux/wiki) - Official tmux wiki and guides
- [Claude Code CLI Documentation](https://docs.anthropic.com/en/docs/claude-code) - Official Claude Code documentation
- [MCP Protocol Specification](https://modelcontextprotocol.io) - Model Context Protocol details
- [Discord Community](https://discord.agentics.org) - Claude Flow community and support