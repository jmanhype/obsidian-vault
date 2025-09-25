# UI-Aware Agents Pattern

**Pattern Type**: Architectural Pattern  
**Domain**: Interactive AI Systems  
**Origin**: CopilotKit and Modern Agent Frameworks  
**Context**: Agent-Native Applications

## Intent

Create AI agents that understand and interact with the user interface context, enabling them to see what users see, manipulate UI elements, and provide contextually relevant assistance.

## Problem

Traditional AI agents operate in isolation from the UI:
- No awareness of current UI state
- Cannot see user interactions
- Unable to manipulate interface elements
- Lack contextual understanding of user actions
- Require explicit descriptions of visual context

## Solution

Build agents that maintain bidirectional awareness with the UI, sharing state between the application and the agent runtime, allowing agents to both observe and control interface elements.

## Structure

```
┌──────────────────┐     State Sync     ┌─────────────────┐
│   UI Component   │ ←─────────────────→ │   AI Agent      │
│   (React/Vue)    │                     │   (Backend)     │
└──────────────────┘                     └─────────────────┘
         ↓                                         ↑
    User Actions                              Agent Actions
         ↓                                         ↑
┌──────────────────────────────────────────────────────┐
│              Shared Context Layer                     │
│  (DOM state, form values, selections, visibility)    │
└──────────────────────────────────────────────────────┘
```

## Implementation

### CopilotKit Approach

```tsx
// Making UI readable to agents
import { useCopilotReadable } from "@copilotkit/react-core";

function Dashboard({ metrics, filters }) {
  // Agent can see dashboard state
  useCopilotReadable({
    description: "Current dashboard metrics and filters",
    value: { metrics, filters, timestamp: Date.now() }
  });
  
  // Agent can also see derived state
  useCopilotReadable({
    description: "User's selected time range",
    value: `${filters.startDate} to ${filters.endDate}`
  });
  
  return <DashboardUI metrics={metrics} />;
}
```

### Bidirectional State Sharing

```tsx
// useCoAgent hook for two-way communication
import { useCoAgent } from "@copilotkit/react-core";

function AgentAwareEditor() {
  const { state, setState } = useCoAgent({
    name: "document_editor",
    initialState: {
      content: "",
      cursorPosition: 0,
      selectedText: null,
      mode: "edit"
    }
  });
  
  // Agent can read and modify editor state
  const handleAgentCommand = (command) => {
    switch (command.type) {
      case "insert_text":
        insertAtCursor(command.text);
        break;
      case "select_paragraph":
        selectParagraph(command.index);
        break;
      case "format_selection":
        formatText(command.format);
        break;
    }
  };
  
  return <Editor state={state} onCommand={handleAgentCommand} />;
}
```

### Visual Context Understanding

```typescript
// Agent understanding visual hierarchy
class UIAwareAgent {
  private domSnapshot: DOMSnapshot;
  private focusedElement: Element | null;
  
  async analyzeContext() {
    // Get current DOM state
    this.domSnapshot = await this.captureDOM();
    
    // Identify key UI regions
    const regions = {
      navigation: this.findRegion('[role="navigation"]'),
      main: this.findRegion('[role="main"]'),
      forms: this.findRegion('form'),
      modals: this.findRegion('[role="dialog"]')
    };
    
    // Understand user's focus
    this.focusedElement = document.activeElement;
    
    // Determine context
    return {
      currentView: this.identifyView(),
      userFocus: this.analyzeFocus(),
      possibleActions: this.detectActions(),
      visibleContent: this.extractVisibleText()
    };
  }
  
  async performUIAction(action: UIAction) {
    // Direct UI manipulation
    switch (action.type) {
      case "click":
        await this.simulateClick(action.selector);
        break;
      case "fill":
        await this.fillField(action.selector, action.value);
        break;
      case "scroll":
        await this.scrollTo(action.position);
        break;
    }
  }
}
```

### React Component Awareness

```tsx
// Agent-aware component with rich context
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  
  // Provide rich context to agent
  useCopilotReadable({
    description: "Product card state",
    value: {
      product: product,
      userInteraction: {
        isHovered,
        isInViewport,
        timeInView: calculateTimeInView()
      },
      uiState: {
        position: getBoundingRect(),
        isAboveFold: isAboveFold(),
        surroundingProducts: getSiblingProducts()
      }
    }
  });
  
  // Agent can trigger UI actions
  useCopilotAction({
    name: "highlight_product",
    handler: () => {
      setHighlighted(true);
      scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  return <Card>...</Card>;
}
```

## Key Capabilities

### 1. Visual Element Recognition
```typescript
// Agent identifies UI elements
const elements = {
  buttons: document.querySelectorAll('button:visible'),
  inputs: document.querySelectorAll('input:not([type="hidden"])'),
  links: document.querySelectorAll('a[href]'),
  images: document.querySelectorAll('img[alt]')
};
```

### 2. Form Understanding
```typescript
// Agent comprehends form structure
const formContext = {
  fields: Array.from(form.elements).map(el => ({
    name: el.name,
    type: el.type,
    label: getLabelFor(el),
    value: el.value,
    required: el.required,
    validation: el.pattern
  }))
};
```

### 3. Layout Awareness
```typescript
// Agent understands spatial relationships
const layout = {
  viewport: { width: window.innerWidth, height: window.innerHeight },
  scroll: { x: window.scrollX, y: window.scrollY },
  sections: identifyLayoutSections(),
  zIndex: analyzeLayering()
};
```

### 4. State Synchronization
```typescript
// Real-time state sync
const stateSync = new StateSync({
  ui: uiStateStore,
  agent: agentStateStore,
  bidirectional: true,
  throttle: 100 // ms
});
```

## Benefits

- **Contextual Assistance**: Agents understand what users are looking at
- **Direct Manipulation**: Agents can interact with UI elements
- **Reduced Friction**: No need to describe UI state to agent
- **Visual Grounding**: Agents reference specific UI elements
- **Seamless Integration**: Natural interaction between agent and UI

## Liabilities

- **Performance Overhead**: Continuous state synchronization
- **Privacy Concerns**: Agent sees all UI content
- **Complexity**: Managing bidirectional state flow
- **Testing Difficulty**: UI-coupled agent behavior
- **Browser Compatibility**: DOM API variations

## Known Uses

1. **CopilotKit**: useCopilotReadable for UI state sharing
2. **Vercel v0**: Agents that generate and modify UI
3. **ChatGPT Canvas**: Direct document manipulation
4. **Replit AI**: Code editor awareness
5. **GitHub Copilot**: IDE context understanding

## Implementation Patterns

### Pattern 1: Selective Context
```tsx
// Only share relevant UI state
useCopilotReadable({
  description: "Visible form fields",
  value: getVisibleFields(),
  filter: (field) => !field.sensitive
});
```

### Pattern 2: Action Boundaries
```tsx
// Define safe UI actions for agents
useCopilotAction({
  name: "modify_ui",
  permissions: ["read", "suggest"],  // Not "write"
  handler: async (action) => {
    await requestUserApproval(action);
    executeAction(action);
  }
});
```

### Pattern 3: Progressive Disclosure
```tsx
// Gradually reveal UI capabilities
const agentCapabilities = {
  level1: ["read_text", "read_structure"],
  level2: ["highlight", "scroll"],
  level3: ["fill_forms", "click_buttons"],
  level4: ["full_control"]
};
```

## Testing Strategies

```typescript
describe('UI-Aware Agent', () => {
  it('should detect visible elements', async () => {
    render(<Dashboard />);
    const context = await agent.analyzeContext();
    expect(context.visibleElements).toContain('dashboard-metric');
  });
  
  it('should respond to UI changes', async () => {
    const { rerender } = render(<Form data={initialData} />);
    rerender(<Form data={updatedData} />);
    
    await waitFor(() => {
      expect(agent.state.formData).toEqual(updatedData);
    });
  });
});
```

## Security Considerations

1. **Input Sanitization**: Validate all agent-triggered actions
2. **Permission Boundaries**: Limit what agents can access
3. **Audit Logging**: Track all agent UI interactions
4. **User Consent**: Explicit approval for sensitive actions
5. **Sandbox Execution**: Isolate agent UI operations

## Related Patterns

- [[Streaming Agent Pattern]] - Real-time updates
- [[Interactive Orchestration Pattern]] - User-guided control
- [[Context Preservation Principle]] - State management
- [[Compound Component Pattern]] - UI composition
- [[Observer Pattern]] - State observation

## Zero-Entropy Insight

"The best agents don't need to be told what you're looking at - they already know."

---
*Pattern essential for next-generation agent-native applications*