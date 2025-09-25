# WebSockets

**Type**: Communication Protocol  
**Domain**: Real-time Web Communication  
**Standardized**: RFC 6455 (2011)  
**Protocol**: ws:// (unencrypted), wss:// (encrypted)  
**Context**: Full-duplex bidirectional communication

## Overview

WebSockets is a communication protocol providing full-duplex, bidirectional communication channels over a single, long-lived TCP connection. It enables real-time data exchange between clients and servers, eliminating the overhead of traditional HTTP request-response cycles.

## Core Concept

> "WebSocket enables streams of messages on top of TCP. TCP alone deals with streams of bytes with no inherent concept of a message."

Unlike HTTP's request-response model, WebSockets maintains an open connection allowing both client and server to send messages at any time.

## How It Works

### Connection Lifecycle

```
1. HTTP Handshake (Upgrade Request)
    ↓
2. Protocol Upgrade (101 Switching Protocols)
    ↓
3. WebSocket Connection Established
    ↓
4. Bidirectional Message Exchange
    ↓
5. Connection Close
```

### Handshake Process

```http
# Client Request
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# Server Response
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

## JavaScript Implementation

### Browser Client

```javascript
// Basic WebSocket connection
const socket = new WebSocket('wss://example.com/socket');

// Connection opened
socket.addEventListener('open', (event) => {
    console.log('Connected to server');
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
    
    // Handle different data types
    if (event.data instanceof Blob) {
        // Handle binary data
        const reader = new FileReader();
        reader.onload = () => console.log(reader.result);
        reader.readAsText(event.data);
    } else {
        // Handle text data
        const data = JSON.parse(event.data);
        processMessage(data);
    }
});

// Handle errors
socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

// Connection closed
socket.addEventListener('close', (event) => {
    console.log('Disconnected from server');
    if (event.wasClean) {
        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
        console.log('Connection died');
    }
});
```

### Node.js Server

```javascript
const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
    console.log('New client connected from', req.socket.remoteAddress);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to WebSocket server'
    }));
    
    // Handle incoming messages
    ws.on('message', (data) => {
        console.log('Received:', data.toString());
        
        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    // Heartbeat to keep connection alive
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
});

// Heartbeat interval
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});
```

## Python Implementation

### Server with websockets Library

```python
import asyncio
import websockets
import json

# Connected clients
clients = set()

async def handle_client(websocket, path):
    """Handle a client connection"""
    # Register client
    clients.add(websocket)
    try:
        # Send welcome message
        await websocket.send(json.dumps({
            'type': 'welcome',
            'message': 'Connected to WebSocket server'
        }))
        
        # Handle messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")
            
            # Broadcast to all clients
            if clients:
                await asyncio.gather(
                    *[client.send(message) for client in clients]
                )
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Unregister client
        clients.remove(websocket)

# Start server
async def main():
    async with websockets.serve(handle_client, "localhost", 8765):
        print("WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
```

### Python Client

```python
import asyncio
import websockets
import json

async def client():
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        # Send initial message
        await websocket.send(json.dumps({
            'type': 'chat',
            'message': 'Hello from Python client!'
        }))
        
        # Listen for messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")
            
            # Respond to specific message types
            if data.get('type') == 'ping':
                await websocket.send(json.dumps({
                    'type': 'pong'
                }))

asyncio.run(client())
```

## Advanced Patterns

### Auto-Reconnection

```javascript
class ReconnectingWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.reconnectInterval = options.reconnectInterval || 1000;
        this.maxReconnectInterval = options.maxReconnectInterval || 30000;
        this.reconnectDecay = options.reconnectDecay || 1.5;
        this.reconnectAttempts = 0;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('Connected');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected');
            this.reconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    reconnect() {
        this.reconnectAttempts++;
        const timeout = Math.min(
            this.reconnectInterval * Math.pow(this.reconnectDecay, this.reconnectAttempts),
            this.maxReconnectInterval
        );
        
        setTimeout(() => {
            console.log('Reconnecting...');
            this.connect();
        }, timeout);
    }
    
    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.error('WebSocket is not connected');
        }
    }
}
```

### Message Queue with Backpressure

```python
import asyncio
from collections import deque

class WebSocketHandler:
    def __init__(self, max_queue_size=1000):
        self.message_queue = deque(maxlen=max_queue_size)
        self.processing = False
        
    async def handle_message(self, websocket, message):
        """Handle incoming messages with backpressure"""
        if len(self.message_queue) >= self.message_queue.maxlen:
            # Apply backpressure
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Server overloaded, please slow down'
            }))
            return
        
        self.message_queue.append(message)
        
        if not self.processing:
            asyncio.create_task(self.process_queue(websocket))
    
    async def process_queue(self, websocket):
        """Process queued messages"""
        self.processing = True
        
        while self.message_queue:
            message = self.message_queue.popleft()
            # Process message
            await self.process_message(message, websocket)
            # Small delay to prevent CPU overload
            await asyncio.sleep(0.01)
        
        self.processing = False
```

### Room-based Broadcasting

```javascript
class WebSocketRooms {
    constructor() {
        this.rooms = new Map();
    }
    
    joinRoom(roomId, client) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(client);
        client.rooms = client.rooms || new Set();
        client.rooms.add(roomId);
    }
    
    leaveRoom(roomId, client) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(client);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
            }
        }
        if (client.rooms) {
            client.rooms.delete(roomId);
        }
    }
    
    broadcast(roomId, message, exclude = null) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).forEach(client => {
                if (client !== exclude && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }
}
```

## Common Use Cases

### 1. Real-time Chat
```javascript
// Chat message handling
socket.send(JSON.stringify({
    type: 'chat',
    room: 'general',
    user: 'Alice',
    message: 'Hello everyone!',
    timestamp: Date.now()
}));
```

### 2. Live Notifications
```python
async def send_notification(websocket, notification):
    await websocket.send(json.dumps({
        'type': 'notification',
        'priority': notification.priority,
        'title': notification.title,
        'body': notification.body,
        'timestamp': datetime.now().isoformat()
    }))
```

### 3. Collaborative Editing
```javascript
// Operational Transform for collaborative editing
socket.send(JSON.stringify({
    type: 'operation',
    operation: {
        type: 'insert',
        position: 42,
        text: 'Hello',
        revision: currentRevision
    }
}));
```

### 4. Real-time Gaming
```javascript
// Game state update
socket.send(JSON.stringify({
    type: 'gameUpdate',
    player: playerId,
    position: { x: 100, y: 200 },
    action: 'move',
    timestamp: performance.now()
}));
```

### 5. Financial Data Streaming
```python
async def stream_market_data(websocket):
    while True:
        market_data = fetch_market_data()
        await websocket.send(json.dumps({
            'type': 'marketData',
            'symbol': market_data.symbol,
            'price': market_data.price,
            'volume': market_data.volume,
            'timestamp': market_data.timestamp
        }))
        await asyncio.sleep(0.1)  # 10 updates per second
```

## Security Considerations

### 1. Authentication
```javascript
// Token-based authentication
const socket = new WebSocket('wss://example.com/socket', {
    headers: {
        'Authorization': `Bearer ${authToken}`
    }
});
```

### 2. Origin Validation
```python
async def validate_origin(websocket, path):
    origin = websocket.request_headers.get('Origin')
    allowed_origins = ['https://trusted-site.com']
    
    if origin not in allowed_origins:
        await websocket.close(1008, 'Origin not allowed')
        return False
    return True
```

### 3. Rate Limiting
```javascript
const rateLimiter = new Map();

function rateLimit(clientId, maxRequests = 10, windowMs = 1000) {
    const now = Date.now();
    const clientData = rateLimiter.get(clientId) || { count: 0, resetTime: now + windowMs };
    
    if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + windowMs;
    }
    
    clientData.count++;
    rateLimiter.set(clientId, clientData);
    
    return clientData.count <= maxRequests;
}
```

## Performance Optimization

### 1. Message Batching
```javascript
class MessageBatcher {
    constructor(socket, batchSize = 10, flushInterval = 100) {
        this.socket = socket;
        this.batch = [];
        this.batchSize = batchSize;
        this.flushInterval = flushInterval;
        this.timer = null;
    }
    
    send(message) {
        this.batch.push(message);
        
        if (this.batch.length >= this.batchSize) {
            this.flush();
        } else if (!this.timer) {
            this.timer = setTimeout(() => this.flush(), this.flushInterval);
        }
    }
    
    flush() {
        if (this.batch.length > 0) {
            this.socket.send(JSON.stringify({
                type: 'batch',
                messages: this.batch
            }));
            this.batch = [];
        }
        clearTimeout(this.timer);
        this.timer = null;
    }
}
```

### 2. Binary Data Transfer
```javascript
// Send binary data for efficiency
const buffer = new ArrayBuffer(256);
const view = new DataView(buffer);
view.setFloat32(0, x);
view.setFloat32(4, y);
view.setFloat32(8, z);
socket.send(buffer);
```

## Comparison with Alternatives

### WebSockets vs HTTP Polling
- **Latency**: WebSockets ~50ms vs Polling ~500ms+
- **Overhead**: Minimal vs HTTP headers each request
- **Scalability**: Better for many concurrent connections
- **Complexity**: Higher implementation complexity

### WebSockets vs Server-Sent Events (SSE)
- **Direction**: Bidirectional vs Server-to-client only
- **Protocol**: Binary + Text vs Text only
- **Reconnection**: Manual vs Automatic
- **Browser Support**: Wider vs Limited (no IE)

### WebSockets vs WebRTC
- **Use Case**: Client-Server vs Peer-to-Peer
- **Latency**: Low vs Ultra-low
- **Complexity**: Moderate vs High
- **NAT Traversal**: Not needed vs Required

## Best Practices

1. **Always use WSS in production** for security
2. **Implement heartbeat/ping-pong** to detect stale connections
3. **Add reconnection logic** with exponential backoff
4. **Handle backpressure** to prevent memory issues
5. **Validate and sanitize** all incoming messages
6. **Use message queues** for reliability
7. **Implement proper error handling** and logging
8. **Consider fallback** to HTTP polling for compatibility
9. **Monitor connection metrics** and performance
10. **Set appropriate timeouts** and limits

## Libraries and Frameworks

### JavaScript/Node.js
- **ws**: Lightweight WebSocket implementation
- **Socket.IO**: Feature-rich with fallbacks
- **uWebSockets.js**: High-performance C++ implementation
- **SockJS**: WebSocket emulation with fallbacks

### Python
- **websockets**: Clean async/await API
- **Tornado**: Asynchronous networking library
- **Flask-SocketIO**: Flask integration
- **Django Channels**: Django WebSocket support

### Other Languages
- **Go**: gorilla/websocket
- **Java**: Java-WebSocket
- **Ruby**: websocket-ruby
- **PHP**: Ratchet
- **Rust**: tokio-tungstenite

## Related Concepts

- [[Server-Sent Events (SSE)]] - Unidirectional alternative
- [[Socket.IO]] - Higher-level abstraction
- [[WebRTC]] - Peer-to-peer communication
- [[HTTP/2 Server Push]] - Alternative real-time technique
- [[Long Polling]] - Fallback mechanism
- [[MQTT]] - IoT messaging protocol
- [[gRPC Streaming]] - RPC with streaming
- [[GraphQL Subscriptions]] - GraphQL real-time
- [[Streaming Agent Pattern]] - AI streaming pattern
- [[Real-time Progress Indicators]] - UI patterns
- [[Backpressure Management]] - Flow control
- [[Circuit Breaker Pattern]] - Fault tolerance

## Zero-Entropy Statement

"WebSockets transform the web from a pull-based archive into a push-based conversation."

---
*The protocol that enables real-time, bidirectional communication on the web*