# Streaming Agent Pattern

**Pattern Type**: Architectural Pattern  
**Domain**: Real-time AI Systems  
**Origin**: CopilotKit + Agent Integration  
**Context**: Automagik Hive v0.2.0

## Intent

Enable AI agents to stream responses in real-time to UI components, providing immediate feedback and allowing user intervention during processing.

## Problem

Traditional agent systems operate in request-response cycles:
- User waits for complete response
- No visibility into agent thinking
- Cannot interrupt or guide mid-process
- Poor user experience for long operations

## Solution

Stream agent outputs progressively to the UI using Server-Sent Events (SSE) or WebSockets, allowing real-time visualization and interaction.

## Structure

```
┌─────────────┐     Stream      ┌──────────────┐
│   Agent     │ ──────────────> │ UI Component │
│  (Backend)  │                  │  (Frontend)  │
└─────────────┘                  └──────────────┘
       ↑                                 ↓
       └────── User Intervention ────────┘
```

## Implementation

### Backend Agent Streaming

```python
# Python/FastAPI Implementation
class StreamingAgent:
    async def process_with_stream(self, task):
        async def generate():
            # Initial thinking
            yield {"type": "thinking", "content": "Analyzing task..."}
            
            # Progressive processing
            for step in self.process_steps(task):
                yield {
                    "type": "progress",
                    "step": step.name,
                    "content": step.result
                }
                
                # Allow interruption check
                if await self.check_interruption():
                    yield {"type": "interrupted"}
                    break
            
            # Final result
            yield {"type": "complete", "result": final_result}
        
        return StreamingResponse(generate(), media_type="text/event-stream")
```

### Frontend Consumption

```typescript
// React/CopilotKit Implementation
function useAgentStream(agentName: string) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const startStream = async (task: string) => {
    setIsStreaming(true);
    const response = await fetch('/api/agent/stream', {
      method: 'POST',
      body: JSON.stringify({ agent: agentName, task }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const message = JSON.parse(chunk);
      
      setMessages(prev => [...prev, message]);
      
      // Handle different message types
      switch (message.type) {
        case 'thinking':
          showThinkingIndicator();
          break;
        case 'progress':
          updateProgressBar(message.step);
          break;
        case 'complete':
          setIsStreaming(false);
          break;
      }
    }
  };
  
  return { messages, isStreaming, startStream };
}
```

### CopilotKit Integration

```tsx
// Streaming with CopilotKit
import { useCopilotAction } from "@copilotkit/react-core";

function StreamingAgentInterface() {
  const [streamData, setStreamData] = useState([]);
  
  useCopilotAction({
    name: "stream_agent_response",
    description: "Stream agent thinking process",
    handler: async function* ({ task }) {
      const agent = new AutomagikAgent();
      
      // Yield chunks as they're generated
      for await (const chunk of agent.streamProcess(task)) {
        yield {
          type: "stream_chunk",
          content: chunk.content,
          metadata: chunk.metadata
        };
        
        // Update UI progressively
        setStreamData(prev => [...prev, chunk]);
      }
    }
  });
  
  return (
    <div className="streaming-interface">
      {streamData.map((chunk, i) => (
        <StreamChunk key={i} {...chunk} />
      ))}
    </div>
  );
}
```

## Consequences

### Benefits
- **Immediate Feedback**: Users see progress instantly
- **Interruptible**: Can stop expensive operations
- **Transparent**: Reveals agent reasoning
- **Better UX**: No loading spinners for long tasks
- **Guided Processing**: Users can steer agents mid-task

### Liabilities
- **Complexity**: More complex than request-response
- **State Management**: Must handle partial states
- **Error Recovery**: Stream interruption handling
- **Network**: Requires stable connections
- **Buffering**: Must manage backpressure

## Known Uses

1. **ChatGPT**: Streams responses word-by-word
2. **GitHub Copilot**: Streams code suggestions
3. **Claude**: Streams long responses
4. **CopilotKit**: Built-in streaming support
5. **Automagik Hive v0.2**: Agent stream visualization

## Related Patterns

- [[Observer Pattern]] - Foundation for streaming
- [[Iterator Pattern]] - Async iteration over streams
- [[Chain of Responsibility]] - Processing pipeline
- [[Pub-Sub Pattern]] - Event distribution

## Implementation Checklist

- [ ] Choose streaming protocol (SSE vs WebSocket)
- [ ] Implement backend streaming
- [ ] Add frontend consumption
- [ ] Handle interruptions
- [ ] Manage partial states
- [ ] Buffer management
- [ ] Error recovery
- [ ] Progress indicators
- [ ] Cancellation mechanism

## Example: Multi-Agent Streaming

```typescript
// Coordinate multiple streaming agents
class MultiAgentStreamer {
  private agents: Map<string, StreamingAgent>;
  
  async *orchestrateStream(task: Task) {
    // Stream from coordinator
    yield* this.streamFrom('coordinator', task);
    
    // Parallel streams from specialists
    const specialists = this.selectSpecialists(task);
    const streams = specialists.map(agent => 
      this.streamFrom(agent, task.subtasks[agent])
    );
    
    // Merge streams
    for await (const chunk of this.mergeStreams(streams)) {
      yield chunk;
    }
    
    // Final synthesis stream
    yield* this.streamFrom('synthesizer', results);
  }
  
  private async *mergeStreams(streams: AsyncIterator[]) {
    // Round-robin or priority-based merging
    while (streams.length > 0) {
      for (const stream of streams) {
        const { value, done } = await stream.next();
        if (!done) yield value;
        else streams = streams.filter(s => s !== stream);
      }
    }
  }
}
```

## Performance Considerations

### Chunking Strategy
```typescript
const chunkConfig = {
  minChunkSize: 10,    // Minimum characters before sending
  maxChunkSize: 200,   // Maximum characters per chunk
  flushInterval: 100,  // ms to wait before forcing send
  compression: true    // Enable compression for large streams
};
```

### Backpressure Management
```typescript
class BackpressureStream {
  private buffer: any[] = [];
  private maxBufferSize = 1000;
  
  async write(chunk: any) {
    if (this.buffer.length >= this.maxBufferSize) {
      // Apply backpressure
      await this.waitForDrain();
    }
    this.buffer.push(chunk);
  }
}
```

## Testing Strategies

```typescript
// Test streaming behavior
describe('StreamingAgent', () => {
  it('should stream chunks progressively', async () => {
    const chunks = [];
    const stream = agent.streamProcess('task');
    
    for await (const chunk of stream) {
      chunks.push(chunk);
      expect(chunk).toHaveProperty('type');
      expect(chunk).toHaveProperty('content');
    }
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[chunks.length - 1].type).toBe('complete');
  });
});
```

## Zero-Entropy Insight

"Streaming transforms AI from oracle to conversation partner."

## Related

### Core Patterns
- [[Observer Pattern]] - Foundation for streaming
- [[Iterator Pattern]] - Async iteration over streams  
- [[Chain of Responsibility]] - Processing pipeline
- [[Pub-Sub Pattern]] - Event distribution
- [[Vibe Coding Pattern]] - Natural language agents
- [[Behavioral Vaccination Pattern]] - AI safety
- [[UI-Aware Agents Pattern]] - Context understanding
- [[Interactive Orchestration Pattern]] - User guidance

### Technologies
- [[CopilotKit - Framework Overview]] - In-app AI framework
- [[Automagik Hive with CopilotKit - Integration Documentation]] - Full integration guide
- [[Server-Sent Events (SSE)]] - Streaming protocol
- [[WebSockets]] - Bidirectional communication
- [[React Server Components]] - Streaming SSR
- [[Vercel AI SDK]] - Streaming utilities
- [[FastAPI WebSocket Architecture]] - Backend streaming

### Implementation Details
- [[Streaming Response Handler]] - Response management
- [[Backpressure Management]] - Flow control
- [[Stream Buffering Strategies]] - Memory optimization
- [[Chunk Aggregation Pattern]] - Message batching
- [[Stream Interruption Handling]] - Error recovery
- [[Progressive Rendering]] - UI updates

### Related Concepts
- [[Real-time Progress Indicators]] - Visual feedback
- [[Agent Status Visualization]] - Live monitoring
- [[Async Generator Functions]] - JavaScript streaming
- [[Reactive Programming]] - Event streams
- [[GraphQL Subscriptions]] - Alternative streaming

### Testing & Performance
- [[Streaming Test Strategies]] - Testing approaches
- [[Stream Performance Metrics]] - Measurement
- [[Network Optimization]] - Bandwidth management
- [[Latency Reduction Techniques]] - Speed optimization
- [[Stream Compression]] - Data optimization

### Use Cases
- [[ChatGPT Streaming]] - Word-by-word responses
- [[GitHub Copilot Streaming]] - Code suggestions
- [[Claude Streaming]] - Long-form content
- [[Live Transcription]] - Audio to text
- [[Real-time Translation]] - Language streaming

### Future Patterns
- [[Multi-Stream Coordination]] - Parallel streams
- [[Stream Transformation Pipeline]] - Data processing
- [[Adaptive Streaming Rate]] - Dynamic throttling
- [[Stream Caching Strategy]] - Offline support
- [[Distributed Streaming]] - Multi-server streams

---
*Pattern essential for modern interactive AI systems*