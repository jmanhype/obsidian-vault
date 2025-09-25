# Engineering Primitive Principle

**Type**: Tool Design Philosophy
**Domain**: Software Engineering Tools
**Zero-Entropy**: The best tools do one thing perfectly and compose infinitely

## Principle Definition

An engineering primitive is a tool that provides fundamental capabilities without imposing opinions about how those capabilities should be used. It maintains simplicity, composability, and user control while avoiding feature creep and architectural opinions.

## The Primitive Hierarchy

```
Primitive Tool → Composed Solutions → Domain Applications
      ↓                ↓                    ↓
   Core Cap.      User Patterns        Specific Uses
```

## Core Characteristics

### 1. Unopinionated
```python
# Primitive approach (Claude Code)
def run_command(cmd):
    return execute(cmd)  # User decides what/how/when

# Opinionated approach (Anti-pattern)
def run_command(cmd):
    if should_run_in_background(cmd):  # Tool decides
        return run_background(cmd)
    else:
        return execute(cmd)
```

### 2. Composable
```bash
# Primitives compose naturally
claude | grep "error" | wc -l  # Unix philosophy

# Claude Code + custom tools
claude + hooks + output_styles + status_lines = custom_workflow
```

### 3. Transparent
```python
# Always know Context, Model, Prompt
def transparent_operation(input):
    context = get_context()  # Visible
    model = get_model()      # Controllable
    prompt = get_prompt()    # Modifiable
    return execute(context, model, prompt)
```

## Claude Code as Primitive

### What Makes It Primitive

1. **Simple Core**: Chat interface + tool execution
2. **No Opinions**: User controls model selection, prompts, execution
3. **Extensible**: Hooks, output styles, status lines
4. **Composable**: Works with any workflow

### The Primitive Test

```python
PRIMITIVE_TEST = {
    "question": "Do I know exactly what Context, Model, and Prompt are at every step?",
    "answer": "Yes"  # Claude Code passes
}
```

## Violations of Primitive Principle

### 1. Plan Mode (Opus plans, Sonnet builds)
```python
# Violation: Tool decides model usage
def plan_mode(prompt):
    plan = opus.generate(prompt)    # Tool's opinion
    result = sonnet.execute(plan)   # Tool's workflow
    return result

# Primitive approach
def execute(prompt, model):
    return model.generate(prompt)   # User's choice
```

### 2. Background Command Management
```python
# Violation: Tool manages processes
def bash(cmd):
    if is_long_running(cmd):
        manage_in_background(cmd)   # Tool's decision
        
# Primitive approach  
def bash(cmd):
    return execute(cmd)             # User's control
```

## The Danger of Feature Creep

### Evolution Path (Warning Signs)
```
Primitive → Convenient Features → Opinions → Framework
    ↓            ↓                   ↓          ↓
 Control     Helpful            Prescribed   Lock-in
```

### Real Example: Aider's Evolution
```
1. Simple diff tool (primitive)
2. Added architect mode (opinion)
3. Added specific workflows (framework)
4. Lost flexibility (lock-in)
```

## Guiding Questions

### For New Features
1. Does this obscure Context, Model, or Prompt?
2. Does this impose a workflow?
3. Does this make decisions for the user?
4. Could this be built ON TOP instead of built IN?

### For Tool Evaluation
```python
def evaluate_tool(tool):
    primitive_score = 0
    
    if tool.shows_context_clearly():
        primitive_score += 1
    if tool.allows_model_choice():
        primitive_score += 1
    if tool.exposes_prompts():
        primitive_score += 1
    if tool.has_no_opinions():
        primitive_score += 1
        
    return primitive_score >= 3  # Is primitive
```

## Benefits of Primitives

### 1. **Infinite Flexibility**
```python
# Build anything on top
custom_workflow = primitive + user_logic
```

### 2. **No Lock-in**
```python
# Easy to switch or modify
if not working:
    swap_primitive(new_tool)  # Simple replacement
```

### 3. **Predictable Behavior**
```python
# What you see is what you get
result = primitive(input)  # No surprises
```

### 4. **Composition Power**
```python
# Combine primitives freely
solution = primitive_a + primitive_b + primitive_c
```

## Anti-Patterns to Avoid

### 1. **Convenience Over Control**
❌ Adding features that "help" by deciding for users
✅ Providing capabilities users can compose

### 2. **Workflow Opinions**
❌ "This is how you should use models"
✅ "Here are models, use them however"

### 3. **Hidden Complexity**
❌ Magic happening behind the scenes
✅ Transparent, understandable operations

### 4. **Feature Bundling**
❌ Kitchen sink approach
✅ Do one thing well

## Examples of Good Primitives

### Unix Tools
```bash
grep  # Search primitive
sed   # Transform primitive  
awk   # Process primitive
```

### Programming Primitives
```python
map()     # Transform primitive
filter()  # Selection primitive
reduce()  # Aggregation primitive
```

### Claude Code (When Primitive)
```python
chat()          # Conversation primitive
run_tool()      # Execution primitive
modify_prompt() # Customization primitive
```

## The Primitive Paradox

**Paradox**: Simple primitives enable complex solutions
**Resolution**: Complexity emerges from composition, not features

```
Simple × Simple × Simple = Complex
But each part remains simple
```

## Best Practices

### 1. **Resist Feature Requests**
```python
# Before adding feature
if can_be_built_on_top():
    document_pattern()  # Show how to compose
else:
    consider_carefully()  # Might not be primitive
```

### 2. **Maintain Transparency**
```python
# Always expose
{
    "context": visible,
    "model": choosable,
    "prompt": modifiable
}
```

### 3. **Document Composition**
Show how to build complex from simple:
```python
# Example: Multi-agent from primitive
agent1 = Claude()
agent2 = Claude()
coordinator = compose(agent1, agent2)
```

## Zero-Entropy Insights

### 1. **Simplicity Is Power**
The simpler the primitive, the more powerful its applications

### 2. **Opinions Limit Possibilities**
Every opinion closes doors to alternative approaches

### 3. **Composition > Configuration**
Building on top beats building in

### 4. **User Control Is Sacred**
Never take control away from the engineer

## The Primitive Manifesto

1. **Do One Thing**: Excel at a single capability
2. **Compose Freely**: Work with anything
3. **Stay Transparent**: Hide nothing
4. **Avoid Opinions**: Let users decide
5. **Resist Complexity**: Simple is sustainable

## Connection to Vault Patterns

### Design Patterns
- [[Unix Philosophy]] - Small, focused tools
- [[SOLID Principles]] - Single responsibility
- [[Composition Over Inheritance]] - Building blocks

### Tool Patterns
- [[Claude Code Output Styles]] - Extension not opinion
- [[Information Rate Optimization]] - User-controlled enhancement
- [[Multi-Agent Status Management]] - Built on top

### Philosophy
- [[Law of Semantic Feedback]] - Clear communication
- [[Zero-Entropy Design]] - Maximum signal
- [[Vibe Coding Pattern]] - Natural expression

## Warning Signs

Watch for these signs of primitive decay:

1. **"We'll handle that for you"**
2. **"Best practices suggest..."**
3. **"Automatically optimizes..."**
4. **"Intelligently decides..."**
5. **"Simplified workflow..."**

## Future of Primitives

### The Ideal
- Tools that disappear into the background
- Pure capability without opinion
- Infinite composition possibilities
- User sovereignty maintained

### The Risk
- Pressure to add convenience
- Market demands for features
- Complexity creep
- Loss of primitive nature

---

*"The best tool is the one that does exactly what you tell it, nothing more, nothing less" - The primitive philosophy*