# Progressive Agent Disclosure Pattern

**Pattern Type**: Interaction Design Pattern  
**Domain**: AI Agent Systems & User Experience  
**Origin**: Progressive Disclosure (Jakob Nielsen, 1995) + Agent Systems  
**Context**: Multi-Agent Orchestration & CopilotKit Integration

## Intent

Gradually reveal agent capabilities, complexity, and internal workings to users based on their expertise level and immediate needs, preventing cognitive overload while maintaining transparency.

## Problem

AI agent systems present inherent complexity challenges:
- Full agent capabilities can overwhelm new users
- Internal orchestration details confuse non-technical users
- Too much transparency creates analysis paralysis
- Hidden complexity breeds mistrust
- One-size-fits-all interfaces fail diverse user groups
- Expert users need deep control while beginners need simplicity

## Solution

Implement layered disclosure of agent functionality, starting with simple interactions and progressively revealing advanced features, technical details, and orchestration mechanics as users demonstrate readiness or explicitly request deeper access.

## Structure

```
Level 1: Simple Interface
    ↓ (user progression)
Level 2: Agent Awareness
    ↓ (expertise growth)
Level 3: Orchestration Visibility
    ↓ (power user mode)
Level 4: Full Control Panel

Each Level Contains:
┌─────────────────┐
│ Visible Features│ ← What users see
├─────────────────┤
│ Hidden Features │ ← Available on demand
├─────────────────┤
│ System Details  │ ← Accessible to experts
└─────────────────┘
```

## Implementation

### Basic Progressive Disclosure

```typescript
// React/CopilotKit Implementation
interface DisclosureLevel {
  beginner: 'simple';
  intermediate: 'aware';
  advanced: 'detailed';
  expert: 'full';
}

function ProgressiveAgentInterface() {
  const [userLevel, setUserLevel] = useState<DisclosureLevel>('simple');
  const [expandedFeatures, setExpandedFeatures] = useState(new Set());
  
  // Automatically detect user expertise
  const detectUserLevel = () => {
    const interactions = getUserInteractionHistory();
    if (interactions.count > 100) return 'advanced';
    if (interactions.count > 20) return 'intermediate';
    return 'beginner';
  };
  
  return (
    <div className="agent-interface">
      {/* Level 1: Simple Chat */}
      <ChatInterface />
      
      {/* Level 2: Show active agents (if intermediate+) */}
      {userLevel !== 'simple' && (
        <AgentStatusBar agents={activeAgents} />
      )}
      
      {/* Level 3: Show orchestration (if advanced+) */}
      {['advanced', 'expert'].includes(userLevel) && (
        <OrchestrationPanel 
          showDetails={userLevel === 'expert'}
        />
      )}
      
      {/* Progressive reveal buttons */}
      <ExpandButton 
        label="Show more options"
        onClick={() => progressToNextLevel()}
      />
    </div>
  );
}
```

### Staged Agent Revelation

```python
# Python/Automagik Hive Implementation
class ProgressiveAgentDisclosure:
    def __init__(self):
        self.disclosure_stages = {
            'stage_1': {
                'label': 'AI Assistant',
                'visible': ['chat', 'basic_help'],
                'hidden': ['agent_type', 'capabilities']
            },
            'stage_2': {
                'label': 'Multi-Agent System',
                'visible': ['agent_names', 'current_task'],
                'hidden': ['orchestration', 'dependencies']
            },
            'stage_3': {
                'label': 'Agent Orchestrator',
                'visible': ['agent_graph', 'task_breakdown'],
                'hidden': ['performance_metrics', 'tokens']
            },
            'stage_4': {
                'label': 'Full Control Panel',
                'visible': ['everything'],
                'hidden': []
            }
        }
    
    async def get_interface(self, user_context):
        stage = self.determine_stage(user_context)
        return self.render_stage(stage)
    
    def determine_stage(self, context):
        # Progressive criteria
        if context.is_developer:
            return 'stage_4'
        elif context.interaction_count > 50:
            return 'stage_3'
        elif context.has_asked_about_agents:
            return 'stage_2'
        else:
            return 'stage_1'
```

### Interactive Disclosure Controls

```tsx
// User-controlled disclosure
function DisclosureControls() {
  const [disclosureSettings, setDisclosureSettings] = useState({
    showAgentNames: false,
    showAgentThinking: false,
    showTokenUsage: false,
    showOrchestration: false,
    showPerformance: false
  });
  
  return (
    <SettingsPanel>
      <Toggle
        label="Show which agents are working"
        checked={disclosureSettings.showAgentNames}
        onChange={(checked) => 
          updateSetting('showAgentNames', checked)
        }
      />
      
      <Toggle
        label="Show agent reasoning process"
        checked={disclosureSettings.showAgentThinking}
        onChange={(checked) => 
          updateSetting('showAgentThinking', checked)
        }
        description="See what agents are thinking"
      />
      
      <AdvancedSection
        collapsed={true}
        label="Developer Options"
      >
        <Toggle
          label="Show token usage"
          checked={disclosureSettings.showTokenUsage}
        />
        <Toggle
          label="Show orchestration graph"
          checked={disclosureSettings.showOrchestration}
        />
      </AdvancedSection>
    </SettingsPanel>
  );
}
```

### Contextual Disclosure

```typescript
// Reveal complexity based on task
class ContextualDisclosure {
  async determineDisclosureLevel(task: Task, user: User) {
    const factors = {
      taskComplexity: this.analyzeTaskComplexity(task),
      userExpertise: user.expertiseLevel,
      errorRate: this.getUserErrorRate(user),
      requestType: task.type
    };
    
    // Simple tasks = simple interface
    if (factors.taskComplexity === 'low') {
      return 'minimal';
    }
    
    // Complex tasks = more transparency
    if (factors.taskComplexity === 'high') {
      return 'detailed';
    }
    
    // High error rate = more guidance
    if (factors.errorRate > 0.3) {
      return 'guided';
    }
    
    return 'standard';
  }
}
```

## Disclosure Patterns

### 1. Tooltip Progression
```tsx
// Gradually detailed tooltips
const tooltipContent = {
  beginner: "AI is processing your request",
  intermediate: "Code Writer agent is generating solution",
  advanced: "Code Writer agent (GPT-4) analyzing context...",
  expert: "Code Writer agent (GPT-4, temp=0.7, max_tokens=2000)"
};
```

### 2. Expandable Details
```tsx
// Collapsible complexity
<AgentCard>
  <Summary>Research Agent completed task</Summary>
  <Details collapsed={true}>
    <Timing>Execution time: 2.3s</Timing>
    <TokenUsage>Tokens used: 1,847</TokenUsage>
    <Sources>Searched 5 sources</Sources>
  </Details>
</AgentCard>
```

### 3. Progressive Menu Depth
```typescript
// Menu items based on expertise
const menuItems = [
  { label: 'Chat', level: 'all' },
  { label: 'View Agents', level: 'intermediate' },
  { label: 'Configure Agents', level: 'advanced' },
  { label: 'Agent Metrics', level: 'expert' },
  { label: 'System Internals', level: 'developer' }
].filter(item => userCanAccess(item.level));
```

### 4. Adaptive Verbosity
```python
def format_response(result, verbosity_level):
    if verbosity_level == 'minimal':
        return result.summary
    elif verbosity_level == 'standard':
        return f"{result.summary}\n\nAgents used: {result.agents}"
    elif verbosity_level == 'detailed':
        return f"""
        {result.summary}
        
        Agents involved:
        {format_agent_details(result.agents)}
        
        Processing steps:
        {format_steps(result.steps)}
        """
    else:  # expert
        return result.full_trace
```

## Implementation Strategies

### 1. User Profiling
```typescript
class UserProfiler {
  assessExpertise(user: User): ExpertiseLevel {
    const signals = {
      accountAge: user.createdAt,
      interactionCount: user.totalInteractions,
      featureUsage: user.featuresUsed,
      errorRecovery: user.errorRecoveryRate,
      helpRequests: user.helpRequestCount,
      advancedFeatures: user.advancedFeatureUsage
    };
    
    return this.calculateLevel(signals);
  }
}
```

### 2. Onboarding Flow
```tsx
// Progressive onboarding
const onboardingSteps = [
  {
    step: 1,
    title: "Welcome to AI Assistant",
    reveals: ['chat_interface']
  },
  {
    step: 2,
    title: "Meet Your Agent Team",
    reveals: ['agent_names', 'agent_roles']
  },
  {
    step: 3,
    title: "Understanding Agent Collaboration",
    reveals: ['agent_communication', 'task_breakdown']
  },
  {
    step: 4,
    title: "Advanced Controls",
    reveals: ['agent_configuration', 'custom_prompts']
  }
];
```

### 3. Just-In-Time Disclosure
```typescript
// Reveal features when relevant
class JustInTimeDisclosure {
  async checkContext(userAction: Action) {
    if (userAction.type === 'complex_query' && 
        !user.hasSeenAgentPanel) {
      this.showHint("Multiple agents are working on this");
      this.revealPanel('agent_status');
    }
    
    if (userAction.failed && 
        !user.hasSeenDebugInfo) {
      this.showHint("View details about what went wrong");
      this.revealPanel('error_details');
    }
  }
}
```

## Benefits

- **Reduced Cognitive Load**: New users aren't overwhelmed
- **Improved Onboarding**: Gradual learning curve
- **User Empowerment**: Control over complexity
- **Better Error Handling**: Progressive error details
- **Increased Trust**: Transparency available when wanted
- **Expert Efficiency**: Power features for advanced users

## Liabilities

- **Hidden Functionality**: Users may miss features
- **Inconsistent Experience**: Different users see different UIs
- **Discovery Challenges**: Features may be hard to find
- **Implementation Complexity**: Multiple interface levels
- **Documentation Burden**: Must document all levels
- **Testing Overhead**: Many combinations to test

## Best Practices

### 1. Clear Progression Indicators
```tsx
<ProgressionIndicator
  currentLevel={2}
  maxLevel={4}
  nextLevelHint="Complete 5 more tasks to unlock"
/>
```

### 2. Persistent Preferences
```typescript
// Remember disclosure preferences
localStorage.setItem('disclosureLevel', user.preferredLevel);
localStorage.setItem('expandedSections', JSON.stringify(expanded));
```

### 3. Contextual Help
```tsx
<HelpButton
  content={getLevelAppropriateHelp(userLevel)}
  showAdvanced={userLevel >= 'intermediate'}
/>
```

### 4. Escape Hatches
```tsx
// Always provide access to full features
<Link to="/expert-mode">
  Switch to Expert Mode
</Link>
```

## Known Uses

1. **Progressive Insurance Flo Chatbot**: Gradual feature revelation
2. **GitHub Copilot**: Progressive code suggestion complexity
3. **Notion AI**: Layered AI capabilities
4. **Adobe Sensei**: Staged AI tool disclosure
5. **Google Bard**: Progressive conversation modes

## Implementation Checklist

- [ ] Define disclosure levels
- [ ] Create user profiling system
- [ ] Design progressive UI components
- [ ] Implement state management
- [ ] Add level transition animations
- [ ] Create onboarding flow
- [ ] Build preference persistence
- [ ] Add discovery hints
- [ ] Include expert mode bypass
- [ ] Test all level combinations

## Related Patterns

- [[UI-Aware Agents Pattern]] - Context understanding
- [[Interactive Orchestration Pattern]] - User control
- [[Streaming Agent Pattern]] - Progressive updates
- [[Compound Component Pattern]] - UI composition
- [[Adaptive Interface Pattern]] - Dynamic UI adjustment

## Zero-Entropy Insight

"The best interface reveals complexity at the speed of understanding."

---
*Pattern essential for making powerful agent systems accessible to all users*