# Server-Sent Events (SSE)

**Type**: Web Communication Protocol  
**Domain**: Real-time Web Applications  
**Standardized**: HTML5 EventSource API (2011)  
**Context**: Unidirectional server-to-client streaming  
**Alternative To**: WebSocket polling, Long polling

## Overview

Server-Sent Events (SSE) is a web standard that allows a server to push real-time updates to web clients over a single HTTP connection. It provides a simple, efficient way to stream live data from server to browser without complex bidirectional protocols.

## Core Concept

> "SSE transforms static web pages into living documents that breathe with real-time data."

Unlike WebSockets' bidirectional communication, SSE is purposefully unidirectional - from server to client only. This simplicity makes it perfect for live updates, notifications, and streaming data scenarios.

## How It Works

### Connection Lifecycle

```
1. Client opens EventSource connection
    ↓
2. Server maintains persistent HTTP connection
    ↓
3. Server sends formatted text data streams
    ↓
4. Client receives events via JavaScript
    ↓
5. Automatic reconnection on disconnection
```

### HTTP Protocol

```http
# Client Request
GET /events HTTP/1.1
Host: example.com
Accept: text/event-stream
Cache-Control: no-cache

# Server Response
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *

data: First message

data: Second message
id: 123
event: custom

data: {"user": "Alice", "message": "Hello"}
event: chat
id: 124
```

## JavaScript Client Implementation

### Basic EventSource Usage

```javascript
// Create connection
const eventSource = new EventSource('/api/events');

// Listen for messages (default event type)
eventSource.addEventListener('message', (event) => {
    console.log('Received:', event.data);
    console.log('Last Event ID:', event.lastEventId);
});

// Listen for custom events
eventSource.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data);
    showNotification(data.title, data.message);
});

// Handle connection events
eventSource.addEventListener('open', (event) => {
    console.log('Connected to event stream');
});

eventSource.addEventListener('error', (event) => {
    if (event.readyState === EventSource.CLOSED) {
        console.log('Connection was closed');
    } else {
        console.log('Error occurred:', event);
    }
});

// Close connection
eventSource.close();
```

### Advanced Client with Retry Logic

```javascript
class RobustEventSource {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.eventSource = null;
        this.listeners = new Map();
        this.reconnectTimeout = null;
        this.maxReconnectTime = options.maxReconnectTime || 30000;
        this.reconnectInterval = options.reconnectInterval || 1000;
        this.connect();
    }
    
    connect() {
        this.eventSource = new EventSource(this.url, this.options);
        
        // Re-attach all listeners
        for (const [event, callback] of this.listeners) {
            this.eventSource.addEventListener(event, callback);
        }
        
        this.eventSource.addEventListener('open', () => {
            console.log('SSE connected');
            this.reconnectInterval = 1000; // Reset backoff
        });
        
        this.eventSource.addEventListener('error', (event) => {
            console.log('SSE error:', event);
            if (this.eventSource.readyState === EventSource.CLOSED) {
                this.scheduleReconnect();
            }
        });
    }
    
    scheduleReconnect() {
        clearTimeout(this.reconnectTimeout);
        
        const timeout = Math.min(
            this.reconnectInterval * (Math.random() + 1),
            this.maxReconnectTime
        );
        
        this.reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connect();
            this.reconnectInterval = Math.min(
                this.reconnectInterval * 1.5,
                this.maxReconnectTime
            );
        }, timeout);
    }
    
    addEventListener(event, callback) {
        this.listeners.set(event, callback);
        if (this.eventSource) {
            this.eventSource.addEventListener(event, callback);
        }
    }
    
    close() {
        clearTimeout(this.reconnectTimeout);
        if (this.eventSource) {
            this.eventSource.close();
        }
    }
}
```

### React Hook Implementation

```javascript
import { useState, useEffect, useCallback } from 'react';

function useServerSentEvents(url, options = {}) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [connectionState, setConnectionState] = useState('connecting');
    
    const eventHandlers = useCallback((eventSource) => {
        eventSource.addEventListener('open', () => {
            setConnectionState('connected');
            setError(null);
        });
        
        eventSource.addEventListener('message', (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setData(parsed);
            } catch (e) {
                setData(event.data);
            }
        });
        
        eventSource.addEventListener('error', (event) => {
            setError('Connection error');
            setConnectionState('error');
        });
    }, []);
    
    useEffect(() => {
        const eventSource = new EventSource(url, options);
        eventHandlers(eventSource);
        
        return () => {
            eventSource.close();
            setConnectionState('closed');
        };
    }, [url, options, eventHandlers]);
    
    return { data, error, connectionState };
}

// Usage in component
function LiveData() {
    const { data, error, connectionState } = useServerSentEvents('/api/live-data');
    
    if (error) return <div>Error: {error}</div>;
    if (connectionState === 'connecting') return <div>Connecting...</div>;
    
    return (
        <div>
            <p>Status: {connectionState}</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
```

## Server Implementation

### Node.js/Express Server

```javascript
const express = require('express');
const app = express();

// SSE endpoint
app.get('/api/events', (req, res) => {
    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Send initial connection message
    res.write('data: Connected to event stream\n\n');
    
    // Store client connection
    const clientId = Date.now();
    clients.set(clientId, res);
    
    // Handle client disconnect
    req.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        clients.delete(clientId);
    });
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);
    
    req.on('close', () => {
        clearInterval(keepAlive);
    });
});

// Broadcast to all clients
const clients = new Map();

function broadcast(data, eventType = 'message', id = null) {
    const message = formatSSEMessage(data, eventType, id);
    
    clients.forEach((res, clientId) => {
        try {
            res.write(message);
        } catch (error) {
            console.log(`Error sending to client ${clientId}:`, error);
            clients.delete(clientId);
        }
    });
}

function formatSSEMessage(data, event = 'message', id = null) {
    let message = '';
    
    if (id) {
        message += `id: ${id}\n`;
    }
    
    if (event !== 'message') {
        message += `event: ${event}\n`;
    }
    
    // Handle multiline data
    const lines = (typeof data === 'string' ? data : JSON.stringify(data))
        .split('\n');
    
    lines.forEach(line => {
        message += `data: ${line}\n`;
    });
    
    message += '\n';
    return message;
}

// Example usage
setInterval(() => {
    broadcast({
        timestamp: new Date().toISOString(),
        message: 'Periodic update',
        value: Math.random()
    }, 'update', Date.now());
}, 5000);
```

### Python FastAPI Implementation

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from typing import AsyncGenerator

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connected clients
clients = set()

async def event_stream(request: Request) -> AsyncGenerator[str, None]:
    """Generate SSE stream"""
    
    # Send initial connection message
    yield f"data: Connected to event stream\n\n"
    
    # Add client to set
    client_queue = asyncio.Queue()
    clients.add(client_queue)
    
    try:
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break
                
            try:
                # Wait for new message or timeout for heartbeat
                message = await asyncio.wait_for(
                    client_queue.get(), 
                    timeout=30
                )
                yield message
            except asyncio.TimeoutError:
                # Send heartbeat
                yield f": heartbeat\n\n"
                
    except asyncio.CancelledError:
        pass
    finally:
        clients.remove(client_queue)

@app.get("/api/events")
async def sse_endpoint(request: Request):
    """SSE endpoint"""
    return StreamingResponse(
        event_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

async def broadcast_message(data: dict, event_type: str = "message", event_id: str = None):
    """Broadcast message to all connected clients"""
    
    if not clients:
        return
        
    message = format_sse_message(data, event_type, event_id)
    
    # Send to all clients
    disconnected = set()
    for client_queue in clients:
        try:
            client_queue.put_nowait(message)
        except asyncio.QueueFull:
            # Client queue full, mark for removal
            disconnected.add(client_queue)
    
    # Remove disconnected clients
    clients.difference_update(disconnected)

def format_sse_message(data: dict, event_type: str = "message", event_id: str = None) -> str:
    """Format data as SSE message"""
    message = ""
    
    if event_id:
        message += f"id: {event_id}\n"
    
    if event_type != "message":
        message += f"event: {event_type}\n"
    
    # Handle data
    data_str = json.dumps(data) if isinstance(data, dict) else str(data)
    for line in data_str.split('\n'):
        message += f"data: {line}\n"
    
    message += "\n"
    return message

# Background task to send periodic updates
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_updates())

async def periodic_updates():
    """Send periodic updates to all clients"""
    while True:
        await asyncio.sleep(10)
        
        await broadcast_message({
            "timestamp": time.time(),
            "message": "Periodic update",
            "active_clients": len(clients)
        }, "update", str(int(time.time())))
```

### Go Implementation

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

type Client struct {
    id     string
    stream chan string
}

type SSEServer struct {
    clients    map[string]*Client
    clientsMux sync.RWMutex
}

func NewSSEServer() *SSEServer {
    return &SSEServer{
        clients: make(map[string]*Client),
    }
}

func (s *SSEServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Set SSE headers
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    
    // Create client
    client := &Client{
        id:     fmt.Sprintf("%d", time.Now().UnixNano()),
        stream: make(chan string, 100),
    }
    
    // Add client
    s.clientsMux.Lock()
    s.clients[client.id] = client
    s.clientsMux.Unlock()
    
    // Remove client on disconnect
    defer func() {
        s.clientsMux.Lock()
        delete(s.clients, client.id)
        s.clientsMux.Unlock()
        close(client.stream)
    }()
    
    // Send initial message
    fmt.Fprintf(w, "data: Connected to event stream\n\n")
    w.(http.Flusher).Flush()
    
    // Listen for messages
    for {
        select {
        case message := <-client.stream:
            fmt.Fprintf(w, "%s", message)
            w.(http.Flusher).Flush()
        case <-r.Context().Done():
            return
        case <-time.After(30 * time.Second):
            // Heartbeat
            fmt.Fprintf(w, ": heartbeat\n\n")
            w.(http.Flusher).Flush()
        }
    }
}

func (s *SSEServer) Broadcast(data interface{}, eventType string, id string) {
    message := s.formatMessage(data, eventType, id)
    
    s.clientsMux.RLock()
    defer s.clientsMux.RUnlock()
    
    for _, client := range s.clients {
        select {
        case client.stream <- message:
        default:
            // Client buffer full, skip
        }
    }
}

func (s *SSEServer) formatMessage(data interface{}, eventType string, id string) string {
    message := ""
    
    if id != "" {
        message += fmt.Sprintf("id: %s\n", id)
    }
    
    if eventType != "message" {
        message += fmt.Sprintf("event: %s\n", eventType)
    }
    
    // Convert data to JSON
    jsonData, _ := json.Marshal(data)
    message += fmt.Sprintf("data: %s\n\n", string(jsonData))
    
    return message
}

func main() {
    server := NewSSEServer()
    
    // SSE endpoint
    http.Handle("/events", server)
    
    // Start periodic updates
    go func() {
        ticker := time.NewTicker(5 * time.Second)
        defer ticker.Stop()
        
        for range ticker.C {
            server.Broadcast(map[string]interface{}{
                "timestamp": time.Now().Unix(),
                "message":   "Periodic update",
                "clients":   len(server.clients),
            }, "update", fmt.Sprintf("%d", time.Now().Unix()))
        }
    }()
    
    log.Println("SSE server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Advanced Patterns

### Event History and Replay

```javascript
class EventHistoryManager {
    constructor(maxEvents = 1000) {
        this.events = [];
        this.maxEvents = maxEvents;
    }
    
    addEvent(data, eventType = 'message', id = null) {
        const event = {
            id: id || Date.now().toString(),
            type: eventType,
            data: data,
            timestamp: new Date()
        };
        
        this.events.push(event);
        
        // Maintain max size
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        
        return event;
    }
    
    getEventsSince(lastEventId) {
        if (!lastEventId) return this.events;
        
        const index = this.events.findIndex(event => event.id === lastEventId);
        return index >= 0 ? this.events.slice(index + 1) : this.events;
    }
    
    replayEvents(res, lastEventId) {
        const events = this.getEventsSince(lastEventId);
        
        events.forEach(event => {
            const message = this.formatSSEMessage(event.data, event.type, event.id);
            res.write(message);
        });
    }
}
```

### Channel-based Broadcasting

```javascript
class SSEChannelManager {
    constructor() {
        this.channels = new Map();
    }
    
    subscribe(channelName, client) {
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, new Set());
        }
        
        this.channels.get(channelName).add(client);
        
        // Return unsubscribe function
        return () => {
            const channel = this.channels.get(channelName);
            if (channel) {
                channel.delete(client);
                if (channel.size === 0) {
                    this.channels.delete(channelName);
                }
            }
        };
    }
    
    broadcast(channelName, data, eventType, id) {
        const channel = this.channels.get(channelName);
        if (!channel) return;
        
        const message = formatSSEMessage(data, eventType, id);
        const disconnected = [];
        
        channel.forEach(client => {
            try {
                client.res.write(message);
            } catch (error) {
                disconnected.push(client);
            }
        });
        
        // Remove disconnected clients
        disconnected.forEach(client => channel.delete(client));
    }
}
```

### Authentication and Authorization

```javascript
const jwt = require('jsonwebtoken');

function authenticatedSSE(req, res, next) {
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        // Set user-specific channel
        req.userChannel = `user_${decoded.id}`;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

app.get('/api/user-events', authenticatedSSE, (req, res) => {
    // SSE implementation with user context
    setupSSEHeaders(res);
    
    const unsubscribe = channelManager.subscribe(req.userChannel, {
        res,
        user: req.user
    });
    
    req.on('close', unsubscribe);
});
```

## Common Use Cases

### 1. Live Notifications

```javascript
// Client
const notifications = new EventSource('/api/notifications');
notifications.addEventListener('notification', (event) => {
    const notification = JSON.parse(event.data);
    showToast(notification.message, notification.type);
});

// Server
function sendNotification(userId, message, type = 'info') {
    broadcast(`user_${userId}`, {
        message,
        type,
        timestamp: new Date().toISOString()
    }, 'notification');
}
```

### 2. Live Chat Updates

```javascript
// Client
const chatStream = new EventSource('/api/chat/room123');
chatStream.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    appendMessage(message.user, message.text, message.timestamp);
});

// Server
function broadcastChatMessage(roomId, user, text) {
    broadcast(`chat_${roomId}`, {
        user,
        text,
        timestamp: new Date().toISOString()
    }, 'message');
}
```

### 3. Live Analytics Dashboard

```javascript
// Client
const analytics = new EventSource('/api/analytics');
analytics.addEventListener('metrics', (event) => {
    const data = JSON.parse(event.data);
    updateDashboard(data);
});

// Server - Send periodic updates
setInterval(() => {
    broadcast('analytics', {
        activeUsers: getActiveUserCount(),
        pageViews: getPageViews(),
        revenue: getCurrentRevenue()
    }, 'metrics');
}, 5000);
```

### 4. Progress Updates

```javascript
// Client
function trackJobProgress(jobId) {
    const progress = new EventSource(`/api/jobs/${jobId}/progress`);
    
    progress.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        updateProgressBar(data.percentage);
    });
    
    progress.addEventListener('complete', (event) => {
        const result = JSON.parse(event.data);
        showResults(result);
        progress.close();
    });
}
```

### 5. Stock Price Updates

```javascript
// Client
const stocks = new EventSource('/api/stocks/stream');
stocks.addEventListener('price', (event) => {
    const update = JSON.parse(event.data);
    updateStockPrice(update.symbol, update.price, update.change);
});

// Server
function streamStockUpdates() {
    // Connect to real-time stock API
    stockAPI.on('price_update', (data) => {
        broadcast('stocks', {
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            timestamp: data.timestamp
        }, 'price');
    });
}
```

## Performance Optimization

### Connection Pooling

```javascript
class ConnectionPool {
    constructor(maxConnections = 1000) {
        this.connections = new Map();
        this.maxConnections = maxConnections;
    }
    
    addConnection(id, connection) {
        if (this.connections.size >= this.maxConnections) {
            // Remove oldest connection
            const oldest = this.connections.keys().next().value;
            this.removeConnection(oldest);
        }
        
        this.connections.set(id, {
            ...connection,
            lastActivity: Date.now()
        });
    }
    
    cleanup() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5 minutes
        
        for (const [id, conn] of this.connections) {
            if (now - conn.lastActivity > timeout) {
                this.removeConnection(id);
            }
        }
    }
}
```

### Message Batching

```javascript
class MessageBatcher {
    constructor(batchSize = 10, flushInterval = 100) {
        this.batch = [];
        this.batchSize = batchSize;
        this.flushInterval = flushInterval;
        this.timer = null;
    }
    
    add(message) {
        this.batch.push(message);
        
        if (this.batch.length >= this.batchSize) {
            this.flush();
        } else if (!this.timer) {
            this.timer = setTimeout(() => this.flush(), this.flushInterval);
        }
    }
    
    flush() {
        if (this.batch.length > 0) {
            const batchMessage = formatSSEMessage({
                type: 'batch',
                messages: this.batch,
                count: this.batch.length
            }, 'batch');
            
            this.broadcast(batchMessage);
            this.batch = [];
        }
        
        clearTimeout(this.timer);
        this.timer = null;
    }
}
```

## Comparison with Alternatives

### SSE vs WebSockets

| Feature | SSE | WebSockets |
|---------|-----|------------|
| **Direction** | Server-to-client only | Bidirectional |
| **Protocol** | HTTP-based | TCP-based |
| **Reconnection** | Automatic | Manual implementation |
| **Complexity** | Simple | More complex |
| **Firewall Issues** | Fewer | More common |
| **Browser Support** | Excellent (except IE) | Excellent |
| **Use Case** | Live updates, notifications | Real-time chat, games |

### SSE vs Long Polling

| Feature | SSE | Long Polling |
|---------|-----|-------------|
| **Efficiency** | More efficient | Less efficient |
| **Real-time** | True real-time | Near real-time |
| **Implementation** | Simpler | More complex |
| **Server Resources** | Lower | Higher |
| **Reconnection** | Built-in | Manual |

## Best Practices

### 1. Connection Management

```javascript
// Set reasonable timeouts
const eventSource = new EventSource('/events', {
    withCredentials: true
});

// Always handle errors
eventSource.onerror = (event) => {
    console.log('SSE error:', event);
    // Implement exponential backoff
};
```

### 2. Data Format Consistency

```javascript
// Standardize message format
function createMessage(type, data, metadata = {}) {
    return {
        type,
        data,
        timestamp: new Date().toISOString(),
        ...metadata
    };
}
```

### 3. Client-side Buffering

```javascript
class SSEBuffer {
    constructor(maxSize = 100) {
        this.buffer = [];
        this.maxSize = maxSize;
    }
    
    add(event) {
        this.buffer.push(event);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }
    
    getRecent(count = 10) {
        return this.buffer.slice(-count);
    }
}
```

### 4. Graceful Degradation

```javascript
function createEventSource(url) {
    if (typeof EventSource !== 'undefined') {
        return new EventSource(url);
    } else {
        // Fallback to long polling
        return new LongPollingEventSource(url);
    }
}
```

## Security Considerations

### 1. CORS Configuration

```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const sseRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 SSE connections per windowMs
    message: 'Too many SSE connections from this IP'
});

app.get('/api/events', sseRateLimit, handleSSE);
```

### 3. Input Validation

```javascript
function validateEventData(data) {
    // Sanitize data before broadcasting
    return {
        message: validator.escape(data.message),
        timestamp: new Date().toISOString(),
        type: validator.isIn(data.type, ['info', 'warning', 'error']) ? data.type : 'info'
    };
}
```

## Debugging and Monitoring

### Connection Monitoring

```javascript
class SSEMonitor {
    constructor() {
        this.metrics = {
            activeConnections: 0,
            totalConnections: 0,
            messagesSent: 0,
            errors: 0
        };
    }
    
    onConnection() {
        this.metrics.activeConnections++;
        this.metrics.totalConnections++;
    }
    
    onDisconnection() {
        this.metrics.activeConnections--;
    }
    
    onMessage() {
        this.metrics.messagesSent++;
    }
    
    onError() {
        this.metrics.errors++;
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}
```

## Browser Compatibility

- **Modern Browsers**: Full support
- **Internet Explorer**: Not supported
- **Edge**: Full support
- **Mobile**: Good support in modern mobile browsers
- **Fallback**: Use polyfills or long polling for IE

## Related Concepts

- [[WebSockets]] - Bidirectional alternative
- [[Long Polling]] - HTTP-based alternative
- [[WebRTC]] - Peer-to-peer communication
- [[GraphQL Subscriptions]] - GraphQL real-time
- [[Socket.IO]] - WebSocket abstraction
- [[Real-time Progress Indicators]] - UI patterns
- [[Streaming Agent Pattern]] - AI streaming
- [[Event-Driven Architecture]] - System design
- [[Pub-Sub Pattern]] - Messaging pattern
- [[HTTP/2 Server Push]] - HTTP-based pushing
- [[WebSocket Connection Manager]] - Connection handling
- [[Stream Performance Metrics]] - Monitoring patterns

## Zero-Entropy Statement

"Server-Sent Events turn the web from a request-response archive into a living stream of consciousness."

---
*Simple, efficient server-to-client streaming for the modern web*