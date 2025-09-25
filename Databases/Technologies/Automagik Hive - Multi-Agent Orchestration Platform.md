# Automagik Hive - Multi-Agent Orchestration Platform

## Technology Overview
**Category**: AI Orchestration Platform  
**Type**: Multi-Agent System with MCP Integration  
**Repository**: [namastex888/atena-hive](https://github.com/namastex888/atena-hive)  
**Status**: Production (with paying customers)  

## Core Architecture

### 3-Layer Team System
```yaml
architecture:
  layer_1_routing:
    description: "Initial request classification and routing"
    agents: ["classifier", "intent_detector"]
    
  layer_2_orchestration:
    description: "Task breakdown and agent coordination"
    agents: ["coordinator", "task_planner", "resource_manager"]
    
  layer_3_execution:
    description: "Claude Code sub-agents for implementation"
    agents: ["up to 10 concurrent task executors"]
    capabilities: ["MCP tools", "custom Python logic", "YAML configs"]
```

## Technical Specifications

### Agent Creation System
```yaml
# YAML-based agent definition
agent:
  name: "code_reviewer"
  role: "Review code for quality and security"
  tools:
    - code_analysis
    - security_scan
    - performance_check
  hooks:
    pre_tool_use:
      - pattern: "*.py"
        action: "run_linter"
    post_tool_use:
      - pattern: "security_scan"
        action: "generate_report"
```

### Hook System Architecture
```python
class HookSystem:
    """TDD-enforced development through hooks"""
    
    hooks = {
        "PreToolUse": lambda tool, args: validate_inputs(args),
        "PostToolUse": lambda tool, result: validate_output(result),
        "Notification": lambda event: notify_team(event),
        "Stop": lambda condition: halt_if_critical(condition)
    }
    
    def enforce_tdd(self, code_change):
        """Enforce test-driven development"""
        if not self.has_tests(code_change):
            raise ValidationError("Tests required before implementation")
```

## MCP Integration

### Available Tools (87 total)
```json
{
  "mcp_tools": {
    "file_operations": ["read", "write", "edit", "search"],
    "git_operations": ["commit", "push", "pull", "branch"],
    "testing": ["run_tests", "coverage", "lint"],
    "deployment": ["docker", "kubernetes", "serverless"],
    "ai_operations": ["agent_spawn", "task_delegate", "result_merge"]
  }
}
```

## Performance Metrics

### Benchmark Results
```yaml
swe_bench_performance:
  solve_rate: 84.8%
  token_efficiency: 32.3% reduction
  speed_improvement: 2.8-4.4x
  
production_metrics:
  deployment_time: 15 minutes
  self_healing_rate: 91%
  state_recovery: 100%
  concurrent_agents: 10 max
```

## Development Workflow

### Quick Start Commands
```bash
# Installation
make install
make dev

# Start with genie system prompt (deprecated in dev branch)
uv run automagik-hive genie

# Initialize workspace with template agents
uvx automagik-hive init workspacepath

# Kanban parallelization tool
npx automagik-forge
```

### Configuration Requirements
```env
# Core settings
HIVE_ENVIRONMENT=development
HIVE_API_PORT=8886
HIVE_DEV_MODE=true

# AI Providers (at least one required)
ANTHROPIC_API_KEY=required
OPENAI_API_KEY=required
GEMINI_API_KEY=optional

# Database
HIVE_DATABASE_URL=postgresql://user:pass@localhost/hive
```

## Integration Points

### Incoming Message Flow
```python
async def handle_message(self, message: Message):
    """Process incoming messages from Omni"""
    # 1. Classify intent
    intent = await self.layer1.classify(message)
    
    # 2. Route to appropriate team
    team = await self.layer2.route(intent)
    
    # 3. Execute via sub-agents
    response = await self.layer3.execute(team, message)
    
    return response
```

### CopilotKit Integration
```javascript
// UI development with CopilotKit
const HiveInterface = () => {
  const { sendMessage, agentResponse } = useCopilotChat({
    apiEndpoint: "/api/hive",
    agentConfig: {
      maxConcurrent: 10,
      enableHooks: true
    }
  });
};
```

## VSM Hierarchy (Viable System Model)

### 5-Layer Cybernetic System
```yaml
vsm_layers:
  S5_identity:
    purpose: "System identity and purpose"
    function: "Define what the system is"
    
  S4_intelligence:
    purpose: "Future planning and adaptation"
    function: "Learn and evolve capabilities"
    
  S3_control:
    purpose: "Resource allocation and optimization"
    function: "Manage agent coordination"
    
  S2_coordination:
    purpose: "Conflict resolution"
    function: "Handle inter-agent communication"
    
  S1_operations:
    purpose: "Primary activities"
    function: "Execute tasks via sub-agents"
```

## Production Considerations

### Stability Requirements
- Dev branch more stable than main (production focus)
- Removed experimental features (genie agents)
- TDD enforcement via hooks
- Self-healing capabilities

### Scaling Architecture
```yaml
scaling:
  horizontal:
    method: "Agent pool expansion"
    max_agents: 10 per instance
    
  vertical:
    method: "Resource allocation"
    memory_per_agent: "2GB recommended"
    
  distributed:
    method: "Multi-instance coordination"
    communication: "Redis pub/sub"
```

## Known Issues (Dev Branch)

### Current Challenges
1. UV system consistency issues
2. Template initialization problems
3. Recent architectural changes causing instability
4. Documentation gaps for onboarding

### Mitigation Strategies
- Use explicit version pinning
- Test in isolated environments
- Follow TDD hook requirements
- Document all configuration changes

---
*Technology documented: September 25, 2025*  
*Branch focus: dev (production-oriented)*