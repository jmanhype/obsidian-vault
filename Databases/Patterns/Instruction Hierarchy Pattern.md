# Instruction Hierarchy Pattern

**Pattern Type**: AI Control Pattern  
**Domain**: Agent Instruction Management  
**Category**: Priority & Conflict Resolution  
**Related**: [[Constitutional AI Pattern]], [[Behavioral Vaccination Pattern]]

## Definition

The Instruction Hierarchy Pattern establishes a clear precedence order for different types of instructions given to AI agents, ensuring that higher-priority directives override lower-priority ones when conflicts arise.

## Core Hierarchy

```
Level 1: Safety & Ethics (CANNOT BE OVERRIDDEN)
    ├── Constitutional principles
    ├── Legal compliance
    └── Harm prevention

Level 2: System Instructions (SYSTEM-LEVEL)
    ├── Core behavior guidelines  
    ├── Operational constraints
    └── Resource limits

Level 3: User Instructions (USER-LEVEL)
    ├── Task-specific requests
    ├── Preference settings
    └── Context modifications

Level 4: Conversational Context (CONTEXTUAL)
    ├── Previous conversation
    ├── Implied requests
    └── Environmental context
```

## Implementation Framework

### 1. **Hierarchical Instruction Processor**
```python
class InstructionHierarchy:
    def __init__(self):
        self.levels = {
            1: SafetyInstructions(),      # Highest priority
            2: SystemInstructions(), 
            3: UserInstructions(),
            4: ContextualInstructions()   # Lowest priority
        }
        self.conflict_resolver = ConflictResolver()
    
    def process_instruction(self, instruction, level, context):
        """Process instruction at given hierarchy level"""
        
        # Validate instruction doesn't violate higher levels
        for higher_level in range(1, level):
            if self.levels[higher_level].conflicts_with(instruction):
                return InstructionRejection(
                    reason=f"Conflicts with Level {higher_level} directive",
                    conflicting_directive=self.levels[higher_level].get_conflict(instruction),
                    suggested_alternative=self.suggest_alternative(instruction, higher_level)
                )
        
        # Process if no conflicts
        return self.levels[level].execute(instruction, context)
    
    def resolve_conflicts(self, instructions):
        """Resolve conflicts between instructions at different levels"""
        conflicts = self.detect_conflicts(instructions)
        
        for conflict in conflicts:
            # Higher level always wins
            winning_instruction = min(conflict.instructions, key=lambda x: x.level)
            losing_instructions = [i for i in conflict.instructions if i != winning_instruction]
            
            # Log conflict resolution
            self.log_conflict_resolution(winning_instruction, losing_instructions)
            
        return self.apply_winning_instructions(conflicts)
```

### 2. **Level-Specific Processors**

#### Level 1: Safety & Ethics
```python
class SafetyInstructions:
    def __init__(self):
        self.immutable_principles = [
            "Do not cause harm to humans",
            "Do not provide illegal information", 
            "Do not violate privacy",
            "Do not generate hateful content",
            "Do not assist in deception"
        ]
        self.legal_constraints = LegalConstraintChecker()
    
    def conflicts_with(self, instruction):
        """Check if instruction violates safety principles"""
        for principle in self.immutable_principles:
            if self.violates_principle(instruction, principle):
                return True
        
        return self.legal_constraints.is_violation(instruction)
    
    def execute(self, instruction, context):
        # Safety instructions are always active, never "executed"
        return SafetyCheckResult(
            allowed=not self.conflicts_with(instruction),
            active_principles=self.get_applicable_principles(instruction)
        )
```

#### Level 2: System Instructions  
```python
class SystemInstructions:
    def __init__(self):
        self.system_constraints = {
            'max_response_length': 4000,
            'allowed_tools': ['read', 'write', 'search'],
            'response_format': 'markdown',
            'tone': 'helpful_professional'
        }
        self.behavioral_guidelines = BehavioralGuidelines()
    
    def execute(self, instruction, context):
        # Apply system-level processing
        processed_instruction = self.apply_constraints(instruction)
        
        # Validate against behavioral guidelines
        if not self.behavioral_guidelines.validate(processed_instruction):
            return SystemRejection("Violates behavioral guidelines")
        
        return SystemProcessedInstruction(processed_instruction)
    
    def conflicts_with(self, instruction):
        return (
            self.exceeds_resource_limits(instruction) or
            self.violates_operational_constraints(instruction) or
            not self.behavioral_guidelines.allows(instruction)
        )
```

#### Level 3: User Instructions
```python
class UserInstructions:
    def __init__(self):
        self.user_preferences = {}
        self.task_processor = TaskProcessor()
    
    def execute(self, instruction, context):
        # Parse user intent
        parsed_intent = self.parse_user_intent(instruction)
        
        # Apply user preferences
        customized_instruction = self.apply_user_preferences(
            parsed_intent, 
            context.user_id
        )
        
        # Process task
        return self.task_processor.execute(customized_instruction, context)
    
    def conflicts_with(self, instruction):
        # User instructions generally don't conflict with each other
        # but may contradict system constraints
        return self.contradicts_current_task(instruction)
```

#### Level 4: Contextual Instructions
```python
class ContextualInstructions:
    def __init__(self):
        self.context_analyzer = ContextAnalyzer()
        self.conversation_memory = ConversationMemory()
    
    def execute(self, instruction, context):
        # Infer implicit instructions from context
        implicit_instructions = self.infer_from_context(context)
        
        # Merge with explicit instruction
        merged_instruction = self.merge_instructions(
            instruction, 
            implicit_instructions
        )
        
        return ContextualProcessedInstruction(merged_instruction)
```

## Conflict Resolution Mechanisms

### 1. **Explicit Override Rules**
```python
class OverrideRules:
    def __init__(self):
        self.override_matrix = {
            # (higher_level, lower_level): resolution_strategy
            (1, 2): 'safety_wins_always',
            (1, 3): 'safety_wins_always', 
            (1, 4): 'safety_wins_always',
            (2, 3): 'system_constraints_limit_user',
            (2, 4): 'system_overrides_context',
            (3, 4): 'explicit_overrides_implicit'
        }
    
    def resolve_conflict(self, high_instruction, low_instruction):
        strategy = self.override_matrix.get(
            (high_instruction.level, low_instruction.level)
        )
        
        if strategy == 'safety_wins_always':
            return ConflictResolution(
                winner=high_instruction,
                reason="Safety principles cannot be overridden",
                action="reject_conflicting_instruction"
            )
        
        elif strategy == 'system_constraints_limit_user':
            return ConflictResolution(
                winner=self.constrain_user_instruction(
                    low_instruction, high_instruction
                ),
                reason="User instruction modified to meet system constraints",
                action="modify_instruction"
            )
        
        return ConflictResolution(winner=high_instruction)
```

### 2. **Dynamic Priority Adjustment**
```python
class DynamicPriority:
    def __init__(self):
        self.context_weights = {
            'emergency_context': {'safety': 1.5, 'user': 0.5},
            'creative_context': {'safety': 1.0, 'user': 1.2},
            'analytical_context': {'system': 1.1, 'user': 1.0}
        }
    
    def adjust_priorities(self, instructions, context):
        context_type = self.classify_context(context)
        weights = self.context_weights.get(context_type, {})
        
        adjusted_instructions = []
        for instruction in instructions:
            adjusted_priority = instruction.priority * weights.get(
                instruction.level_name, 1.0
            )
            
            adjusted_instructions.append(
                instruction.with_priority(adjusted_priority)
            )
        
        return sorted(adjusted_instructions, key=lambda x: x.priority, reverse=True)
```

## Implementation Examples

### 1. **Chat Agent Hierarchy**
```python
class ChatAgentHierarchy(InstructionHierarchy):
    def __init__(self):
        super().__init__()
        
        # Level 1: Safety
        self.add_safety_instruction("Never generate harmful content")
        self.add_safety_instruction("Protect user privacy")
        
        # Level 2: System  
        self.add_system_instruction("Be helpful and informative")
        self.add_system_instruction("Respond in markdown format")
        self.add_system_instruction("Keep responses under 2000 words")
        
        # Level 3: User (dynamic)
        # User instructions added per conversation
        
        # Level 4: Context (automatic)
        self.enable_context_inference()
    
    def process_user_message(self, message, user_context):
        # Extract instructions from user message
        user_instructions = self.extract_user_instructions(message)
        
        # Process through hierarchy
        processed_instructions = []
        for instruction in user_instructions:
            result = self.process_instruction(instruction, 3, user_context)
            if isinstance(result, InstructionRejection):
                return self.explain_rejection(result)
            processed_instructions.append(result)
        
        # Generate response using processed instructions
        return self.generate_response(processed_instructions, user_context)
```

### 2. **Code Assistant Hierarchy**
```python
class CodeAssistantHierarchy(InstructionHierarchy):
    def __init__(self):
        super().__init__()
        
        # Level 1: Safety
        self.add_safety_instruction("Never generate malicious code")
        self.add_safety_instruction("No code that could harm systems")
        
        # Level 2: System
        self.add_system_instruction("Follow secure coding practices")
        self.add_system_instruction("Include error handling")
        self.add_system_instruction("Add appropriate comments")
        
        # Level 3: User preferences
        self.user_preferences = {
            'language': 'python',
            'style': 'pep8',
            'verbosity': 'detailed'
        }
    
    def generate_code(self, user_request, context):
        # Check safety first
        if self.violates_safety(user_request):
            return SafetyViolation("Request could generate harmful code")
        
        # Apply system constraints
        constrained_request = self.apply_coding_standards(user_request)
        
        # Apply user preferences
        personalized_request = self.apply_user_preferences(
            constrained_request, 
            context.user_id
        )
        
        return self.code_generator.generate(personalized_request)
```

### 3. **Research Agent Hierarchy**
```python
class ResearchAgentHierarchy(InstructionHierarchy):
    def __init__(self):
        super().__init__()
        
        # Level 1: Safety & Ethics
        self.add_safety_instruction("Only use authorized sources")
        self.add_safety_instruction("Respect copyright and fair use")
        self.add_safety_instruction("No invasive data collection")
        
        # Level 2: Research Standards
        self.add_system_instruction("Verify information from multiple sources")
        self.add_system_instruction("Cite all sources properly")
        self.add_system_instruction("Distinguish fact from opinion")
        
        # Level 3: User Research Goals
        self.research_parameters = ResearchParameters()
    
    def conduct_research(self, research_query, context):
        # Validate research query against ethics
        if not self.is_ethical_research(research_query):
            return EthicsViolation("Research query violates ethical guidelines")
        
        # Apply research methodology standards
        structured_query = self.structure_research_query(research_query)
        
        # Execute research with user parameters
        return self.research_engine.execute(structured_query, context)
```

## Advanced Features

### 1. **Instruction Learning**
```python
class InstructionLearner:
    def __init__(self, hierarchy):
        self.hierarchy = hierarchy
        self.pattern_detector = PatternDetector()
        self.feedback_processor = FeedbackProcessor()
    
    def learn_from_interactions(self, interaction_history):
        """Learn instruction patterns from user interactions"""
        patterns = self.pattern_detector.detect_patterns(interaction_history)
        
        for pattern in patterns:
            if pattern.success_rate > 0.8 and pattern.frequency > 10:
                # Promote successful patterns to higher levels
                if pattern.level < 3:  # Don't promote above user level
                    self.hierarchy.promote_instruction(pattern.instruction, pattern.level + 1)
            
            elif pattern.success_rate < 0.3:
                # Demote or remove unsuccessful patterns
                self.hierarchy.demote_instruction(pattern.instruction)
    
    def incorporate_feedback(self, instruction, user_feedback):
        """Adjust instruction priority based on feedback"""
        if user_feedback.satisfaction > 0.8:
            self.hierarchy.increase_priority(instruction, 0.1)
        elif user_feedback.satisfaction < 0.3:
            self.hierarchy.decrease_priority(instruction, 0.1)
```

### 2. **Context-Sensitive Hierarchies**
```python
class ContextSensitiveHierarchy:
    def __init__(self):
        self.base_hierarchy = InstructionHierarchy()
        self.context_modifiers = {
            'emergency': EmergencyModifier(),
            'creative': CreativeModifier(),
            'analytical': AnalyticalModifier(),
            'educational': EducationalModifier()
        }
    
    def get_context_hierarchy(self, context):
        """Adjust hierarchy based on context"""
        context_type = self.classify_context(context)
        modifier = self.context_modifiers.get(context_type)
        
        if modifier:
            return modifier.modify_hierarchy(self.base_hierarchy, context)
        
        return self.base_hierarchy
    
    def process_in_context(self, instruction, context):
        context_hierarchy = self.get_context_hierarchy(context)
        return context_hierarchy.process_instruction(instruction, context)
```

## Monitoring and Debugging

### 1. **Hierarchy Visualization**
```python
class HierarchyVisualizer:
    def generate_hierarchy_diagram(self, hierarchy, active_instructions):
        """Generate visual representation of instruction hierarchy"""
        diagram = HierarchyDiagram()
        
        for level in range(1, 5):
            level_instructions = hierarchy.get_level_instructions(level)
            diagram.add_level(level, level_instructions)
            
            # Highlight conflicts
            conflicts = hierarchy.get_level_conflicts(level)
            for conflict in conflicts:
                diagram.highlight_conflict(conflict)
        
        return diagram.render()
    
    def trace_instruction_processing(self, instruction, processing_result):
        """Show how instruction was processed through hierarchy"""
        trace = ProcessingTrace()
        
        for step in processing_result.processing_steps:
            trace.add_step(
                level=step.level,
                action=step.action,
                result=step.result,
                conflicts=step.conflicts_detected
            )
        
        return trace.format_for_display()
```

### 2. **Conflict Analytics**
```python
class ConflictAnalytics:
    def __init__(self):
        self.conflict_history = []
        self.resolution_patterns = {}
    
    def analyze_conflict_patterns(self):
        """Identify common conflict patterns"""
        patterns = {}
        
        for conflict in self.conflict_history:
            pattern_key = f"{conflict.high_level}vs{conflict.low_level}"
            if pattern_key not in patterns:
                patterns[pattern_key] = {
                    'count': 0,
                    'resolutions': {},
                    'user_satisfaction': []
                }
            
            patterns[pattern_key]['count'] += 1
            
            resolution = conflict.resolution.strategy
            patterns[pattern_key]['resolutions'][resolution] = (
                patterns[pattern_key]['resolutions'].get(resolution, 0) + 1
            )
        
        return ConflictAnalysisReport(patterns)
    
    def suggest_hierarchy_improvements(self):
        """Suggest improvements based on conflict analysis"""
        analysis = self.analyze_conflict_patterns()
        suggestions = []
        
        for pattern, data in analysis.patterns.items():
            if data['count'] > 20:  # Frequent conflict
                suggestion = HierarchyImprovement(
                    pattern=pattern,
                    frequency=data['count'],
                    recommended_action=self.generate_recommendation(pattern, data)
                )
                suggestions.append(suggestion)
        
        return suggestions
```

## Best Practices

1. **Clear Level Definitions**: Make hierarchy levels explicit and well-documented
2. **Immutable Safety Layer**: Level 1 safety instructions should never be overridable
3. **Transparent Conflicts**: Always explain why instructions were rejected or modified
4. **User Education**: Help users understand the hierarchy through clear feedback
5. **Regular Review**: Periodically audit and update hierarchy effectiveness
6. **Context Adaptation**: Allow hierarchy to adapt to different contexts appropriately
7. **Conflict Logging**: Track all conflicts for analysis and improvement

## Anti-Patterns

1. **Rigid Hierarchy**: Never allowing any flexibility or context sensitivity
2. **Unclear Precedence**: Not clearly defining which level takes priority
3. **Hidden Conflicts**: Not informing users when their instructions conflict
4. **Over-Complex Rules**: Creating too many hierarchy levels or exception cases
5. **Safety Bypass**: Allowing any mechanism to override safety instructions
6. **No User Feedback**: Rejecting instructions without explanation

## Integration Examples

### 1. **Multi-Agent Systems**
```python
class MultiAgentHierarchy:
    def __init__(self):
        self.agent_hierarchies = {
            'coordinator': CoordinatorHierarchy(),
            'researcher': ResearcherHierarchy(), 
            'writer': WriterHierarchy(),
            'reviewer': ReviewerHierarchy()
        }
    
    def coordinate_agent_instructions(self, global_instruction, context):
        # Distribute instruction to agents based on their hierarchies
        agent_instructions = {}
        
        for agent_name, hierarchy in self.agent_hierarchies.items():
            agent_specific = self.adapt_instruction_for_agent(
                global_instruction, agent_name
            )
            agent_instructions[agent_name] = hierarchy.process_instruction(
                agent_specific, context
            )
        
        return self.coordinate_agent_responses(agent_instructions)
```

### 2. **Tool Integration**
```python
class ToolHierarchy(InstructionHierarchy):
    def __init__(self):
        super().__init__()
        self.tool_constraints = ToolConstraints()
    
    def process_tool_instruction(self, tool_name, instruction, context):
        # Check tool-specific safety constraints
        if not self.tool_constraints.is_safe(tool_name, instruction):
            return ToolSafetyViolation(tool_name, instruction)
        
        # Process through standard hierarchy
        result = super().process_instruction(instruction, 3, context)
        
        # Apply tool-specific modifications
        return self.tool_constraints.apply_modifications(
            tool_name, result, context
        )
```

## Related Patterns

- [[Constitutional AI Pattern]] - Training-time principle establishment
- [[Behavioral Vaccination Pattern]] - Preventive constraint injection
- [[Guardrail Pattern]] - Runtime safety enforcement
- [[Multi-Agent Consensus Pattern]] - Collaborative decision making
- [[Human-in-the-Loop Pattern]] - Human oversight integration

## Zero-Entropy Insights

### 1. **Hierarchy Enables Autonomy**
Clear precedence rules allow agents to make decisions independently

### 2. **Safety First Architecture**  
Making safety the highest priority prevents harmful instruction conflicts

### 3. **User Empowerment Through Constraints**
Well-defined limits help users understand what's possible

### 4. **Context Shapes Priority**
Different situations may require different instruction hierarchies

---

*Instruction Hierarchy Pattern provides clear precedence rules for managing conflicting directives in AI agent systems*