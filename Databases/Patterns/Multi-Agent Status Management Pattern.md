# Multi-Agent Status Management Pattern

**Type**: Orchestration Visibility Pattern
**Domain**: Parallel Agent Systems
**Zero-Entropy**: Perfect awareness enables perfect coordination

## Pattern Definition

Multi-Agent Status Management is the practice of maintaining real-time visibility into parallel agent operations through persistent state tracking, status indicators, and context preservation. It enables efficient coordination of multiple AI agents working simultaneously.

## The Visibility Hierarchy

```
Global Overview → Agent Status → Task Progress → Prompt History
       ↓              ↓              ↓              ↓
   All Agents    Individual      Current Work   Context Trail
```

## Core Components

### 1. Agent Identity Management

```python
class AgentIdentity:
    def __init__(self):
        self.id = generate_uuid()
        self.name = self.generate_name()  # One-word memorable name
        self.role = None
        self.created_at = timestamp()
        
    def generate_name(self):
        # Use local LLM for creative names
        return local_llm.generate(
            "One-word agent name, creative, memorable",
            max_tokens=10,
            timeout=5
        )
```

### 2. Status Line Architecture

```python
class StatusLine:
    """Multi-level status tracking"""
    
    def __init__(self, level):
        self.levels = {
            1: self.basic_status,      # Model, CWD, Git
            2: self.prompt_tracking,    # + Last prompt
            3: self.agent_awareness,    # + Agent name, history
            4: self.full_orchestration  # + All agents status
        }
        
    def render(self):
        return self.levels[self.level]()
```

### 3. Session State Persistence

```json
{
  "session_id": "uuid",
  "agent_name": "Cipher",
  "prompts": [
    {"text": "implement auth", "timestamp": "..."},
    {"text": "run tests", "timestamp": "..."},
    {"text": "deploy", "timestamp": "..."}
  ],
  "state": "implementing",
  "metrics": {
    "tokens_used": 15420,
    "commands_run": 34,
    "files_modified": 12
  }
}
```

## Implementation Patterns

### Pattern 1: Trailing Context Window

```python
class PromptHistory:
    def __init__(self, window_size=3):
        self.history = deque(maxlen=window_size)
        
    def add(self, prompt):
        self.history.append({
            'text': prompt[:50],  # Truncate for display
            'full': prompt,
            'time': now()
        })
        
    def display(self):
        # Show most recent first
        return ' | '.join(reversed([p['text'] for p in self.history]))
```

### Pattern 2: Parallel Agent Tracking

```python
class MultiAgentMonitor:
    def __init__(self):
        self.agents = {}
        
    def register(self, agent_id, instance_info):
        self.agents[agent_id] = {
            'name': instance_info['name'],
            'status': 'idle',
            'current_task': None,
            'started': now()
        }
        
    def update_status(self, agent_id, status, task=None):
        if agent_id in self.agents:
            self.agents[agent_id]['status'] = status
            self.agents[agent_id]['current_task'] = task
            
    def render_dashboard(self):
        return '\n'.join([
            f"{a['name']}: {a['status']} - {a['current_task'] or 'idle'}"
            for a in self.agents.values()
        ])
```

### Pattern 3: State Synchronization

```python
class StateSync:
    def __init__(self, storage_path='.claude/data'):
        self.storage = storage_path
        self.lock = threading.Lock()
        
    def write_state(self, agent_id, state):
        with self.lock:
            path = f"{self.storage}/sessions/{agent_id}.json"
            with open(path, 'w') as f:
                json.dump(state, f)
                
    def read_state(self, agent_id):
        path = f"{self.storage}/sessions/{agent_id}.json"
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return {}
```

## Real-World Implementation: Claude Code

### Status Line Evolution

```python
# Level 1: Basic
"claude-3.5-sonnet | ~/project | main | 2 changes"

# Level 2: Prompt Aware
"claude-3.5-sonnet | Last: 'implement auth system'"

# Level 3: Agent Identity
"Cipher | 🔧 implement auth | History: [auth, test, deploy]"

# Level 4: Multi-Agent Orchestra
"""
Cipher: implementing auth ████░░░░ 60%
Quantum: running tests ██████░░ 80% 
Nova: updating docs ████████ 100% ✓
"""
```

### Hook Integration

```python
# user-prompt-submit hook
def on_prompt_submit(prompt):
    session = load_session()
    session['prompts'].append(prompt)
    
    if not session.get('agent_name'):
        session['agent_name'] = generate_agent_name()
        
    save_session(session)
    update_status_line(session)
```

## Use Cases

### 1. Parallel Development
```bash
# Terminal 1: Backend development
claude --name "Backend"

# Terminal 2: Frontend development  
claude --name "Frontend"

# Terminal 3: Testing
claude --name "Tester"

# Master view shows all three
```

### 2. Long-Running Tasks
```python
# Agent 1: Processing with TTS notification
set_output_style("text_to_speech")
run_long_task("analyze_codebase")
# Audio: "Analysis complete. Found 47 issues."

# Meanwhile Agent 2 continues working
```

### 3. Context Switching
```python
# Quickly identify what each instance was doing
for agent in active_agents:
    print(f"{agent.name}: {agent.last_prompt}")
    
# Output:
# Cipher: "implement auth"
# Quantum: "write tests"  
# Nova: "update documentation"
```

## Zero-Entropy Insights

### 1. **Names Create Identity**
Agents with names are easier to track than IDs

### 2. **Visibility Enables Velocity**
Knowing state reduces context switching overhead

### 3. **History Provides Context**
Trailing prompts eliminate "what was I doing?"

### 4. **Parallel Requires Perspective**
Multiple agents need unified monitoring

## Best Practices

### 1. **Automatic Naming**
```python
# Generate memorable names automatically
names = ["Cipher", "Quantum", "Nova", "Phoenix", "Atlas"]
```

### 2. **Persistent Sessions**
```python
# Always restore previous state
session = restore_session() or create_new_session()
```

### 3. **Visual Indicators**
```python
STATUS_EMOJIS = {
    "idle": "💤",
    "thinking": "🤔",
    "working": "⚡",
    "complete": "✅",
    "error": "❌"
}
```

### 4. **Rate Limiting**
```python
# Don't update too frequently
UPDATE_INTERVAL = 1.0  # seconds
last_update = 0

def maybe_update():
    if time() - last_update > UPDATE_INTERVAL:
        update_status_line()
```

## Anti-Patterns to Avoid

### 1. **Information Overload**
❌ Showing all data all the time
✅ Progressive disclosure based on need

### 2. **Synchronization Conflicts**
❌ Multiple agents writing to same state
✅ Locked, atomic state updates

### 3. **Stale Status**
❌ Status that doesn't reflect reality
✅ Real-time updates with timestamps

### 4. **Anonymous Agents**
❌ Generic "Agent-1", "Agent-2"
✅ Memorable, unique names

## Advanced Techniques

### 1. Hierarchical Status
```python
# Global → Team → Agent → Task
global_status = {
    "teams": {
        "backend": ["Cipher", "Quantum"],
        "frontend": ["Nova", "Phoenix"]
    }
}
```

### 2. Predictive Status
```python
# Estimate completion based on patterns
def estimate_completion(agent):
    similar_tasks = find_similar(agent.current_task)
    return average_duration(similar_tasks)
```

### 3. Status Aggregation
```python
# Combine multiple agent states
def team_status(team_name):
    agents = get_team_agents(team_name)
    return {
        "progress": average([a.progress for a in agents]),
        "blockers": [a.blockers for a in agents if a.blocked],
        "eta": max([a.eta for a in agents])
    }
```

## Connection to Vault Patterns

### Orchestration Patterns
- [[Multi-Agent Convergence]] - Coordination strategies
- [[Swarm Orchestration Pattern]] - Large-scale management
- [[Agent-Tool Convergence]] - Tool-specific status

### Communication Patterns
- [[Information Rate Optimization]] - Efficient status display
- [[Generative UI Pattern]] - Dynamic status interfaces
- [[Law of Semantic Feedback]] - Meaningful status messages

### Learning Patterns
- [[Behavioral Vaccination Pattern]] - Learning from confusion
- [[Pareto Frontier Evolution]] - Optimal status strategies

## Implementation Checklist

- [ ] Agent naming system
- [ ] Session state persistence
- [ ] Status line renderer
- [ ] Multi-agent dashboard
- [ ] Prompt history tracking
- [ ] State synchronization
- [ ] Visual indicators
- [ ] Update rate limiting
- [ ] Error recovery

## Future Evolution

### 1. **Swarm Status Visualization**
3D visualization of hundreds of agents

### 2. **Predictive Coordination**
AI predicting and preventing conflicts

### 3. **Semantic Status Messages**
Status that explains itself

### 4. **Cross-System Federation**
Status sharing between different tools

---

*Perfect visibility enables perfect parallel execution - when you know everything, you can do anything*