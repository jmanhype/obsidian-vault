# Claude Code Output Styles and Status Lines

**Source**: [YouTube - Engineers… Claude Code Output Styles Are Here](https://www.youtube.com/watch?v=mJhsWrEv-Go)
**Type**: Feature Analysis
**Key Innovation**: Generative UI - First practical application of dynamic UI generation in agent coding

## Output Styles Overview

Claude Code now supports multiple output formats that update the system prompt to control response style:

### 1. HTML/GenUI Format (Most Important)
- **What**: Generates dynamic HTML on every response
- **Why**: First useful application of "Generative UI"
- **How**: Agent creates interactive HTML guides/interfaces on the fly
- **Use Case**: Rich visual responses, documentation, interactive guides
- **Example**: Generates complete HTML guide with styling for "how to add a hook"

### 2. YAML Format
- **What**: Highly structured response format
- **Why**: Surprisingly improves agent performance
- **Structure**:
  ```yaml
  task: "Analyze hook system"
  status: "complete"
  details: "Structured information"
  ```
- **Benefit**: Forces structured thinking and organization

### 3. Table Format
- **What**: Clean formatted tables
- **Use Case**: Organizing comparative information
- **Benefit**: Speeds up information flow

### 4. Ultra Concise Format
- **What**: Minimal response style
- **Benefit**: Reduces input/output token consumption
- **Use Case**: Quick answers, reduced verbosity

### 5. Text-to-Speech Summary
- **What**: Audio summary after task completion
- **Use Case**: Multiple agents running in parallel
- **Benefit**: Audio notification when long-running tasks complete

### 6. Default Format
- Standard Claude Code response format

### 7. Bullet Points Format
- Structured list-based responses

## Status Lines Feature

Customizable interface showing agent state and context.

### Implementation Levels

#### Level 1: Basic Status Line
```
Model | CWD | Git Branch | Changes | Claude Version
```

#### Level 2: Last Prompt Tracking
```
Model | Last Executed Prompt: "hi"
```
- Shows most recent prompt
- Critical for managing multiple instances

#### Level 3: Agent Naming + Prompt History
```
Agent: [Generated Name] | Recent: [Last 3 Prompts]
```
- Auto-generates unique agent names using local LLM
- Tracks trailing prompt history
- Uses session state management

### Technical Implementation

**State Management**:
- Session data stored in `.claude/data/sessions/`
- JSON objects tracking:
  - Session ID
  - Agent name
  - Prompt history
  - Timestamps

**Hook Integration**:
- `user-prompt-submit` hook updates session state
- Combines with status line for real-time updates
- Uses on-device model (GPT-OSS 20B) for agent naming

## The Generative UI Revolution

### Key Insight
"With output styles, Claude Code agents can build UI on the fly"

### How It Works
1. Agent generates HTML structure
2. Writes to temporary file
3. Opens in browser
4. Provides rich, interactive response

### Implications
- Not a gimmick - powerful agent decoding pattern
- Enables richer human-agent interaction
- Foundation for interactive terminal UIs
- No limits to capability expansion

## Core Principle

**Fundamental Value**: Increasing information rate between engineers and agents

### The Big Three
Every agentic system has only three key elements:
1. **Context**
2. **Model** 
3. **Prompt**

Output styles modify the prompt to control agent behavior.

## Criticism and Concerns

### Features Viewed as Overreach

#### 1. Plan Mode (Opus plans, Sonnet builds)
- Similar to Aider's architect mode
- Violates unopinionated primitive principle
- Engineer should control model usage

#### 2. Background Bash Commands
- Tool shouldn't manage background processes
- Loss of directional focus

### Guiding Question
"Do I know exactly what the context, model, and prompt are at every step?"

Any feature obscuring or inserting opinions about managing the "big three" raises red flags.

## Best Practices

### For Multiple Agents
1. Use text-to-speech for long-running tasks
2. Implement status lines with prompt history
3. Use unique agent naming for identification

### For Better Agents
1. Choose output style based on task type
2. Use YAML for structured thinking
3. Implement GenUI for complex documentation

### Advanced Techniques
- Conditional branches in output style prompts
- Merge multiple output types
- Dynamic style selection based on prompt content

## Key Takeaways

1. **Output styles are not cosmetic** - They fundamentally change agent behavior
2. **Status lines enable multi-agent workflows** - Critical for parallel operations
3. **Generative UI is revolutionary** - First practical implementation
4. **Simplicity matters** - Claude Code's power lies in being an unopinionated primitive
5. **State management enhances everything** - Hooks + status lines = powerful capabilities

## Implementation Tips

### Setting Output Style
```bash
/output-style genui  # For generative UI
/output-style yaml   # For structured responses
/output-style tts    # For audio summaries
```

### Configuring Status Line
In `.claude/settings.json`:
```json
{
  "status_line": "path/to/status_line_v3.py"
}
```

### Creating Custom Styles
Modify system prompt to include specific formatting instructions based on task type.

---

*"Never bet on your first initial reaction without doing the work" - The presenter initially thought output styles were useless, then discovered their true power through implementation.*