# Automagik Omni - Unified Messaging Hub

## Technology Overview
**Category**: Message Orchestration Platform  
**Type**: Multi-Tenant WhatsApp/Discord/Slack Hub  
**Repository**: namastex888/automagik-omni  
**Critical PR**: #25 (Unified messaging features)  
**Status**: Development with PR #25 integration  

## Core Functionality

### Unified Messaging Architecture
```yaml
messaging_flow:
  input_channels:
    - WhatsApp (via Evolution API)
    - Discord (native integration)
    - Slack (webhook based)
    
  processing:
    - Message normalization
    - Tenant identification
    - Routing logic
    - Response formatting
    
  output:
    - Hive orchestrator integration
    - Direct responses
    - Webhook callbacks
```

## Technical Architecture

### Multi-Tenant Management
```python
class TenantManager:
    """Handle multiple WhatsApp instances"""
    
    def __init__(self):
        self.instances = {}
        self.webhook_registry = {}
        
    async def create_instance(self, tenant_id: str, config: dict):
        """Create new WhatsApp instance for tenant"""
        instance = await evolution_api.create_instance({
            "instanceName": f"tenant_{tenant_id}",
            "webhook": f"{OMNI_BASE_URL}/webhooks/evolution/{tenant_id}",
            "qrcode": True
        })
        self.instances[tenant_id] = instance
        return instance
        
    async def route_message(self, message: IncomingMessage):
        """Route message to appropriate handler"""
        tenant = self.identify_tenant(message)
        if self.hive_enabled:
            return await self.forward_to_hive(tenant, message)
        return await self.process_locally(tenant, message)
```

### PR #25 Features (Unified Messaging)
```yaml
pr_25_additions:
  unified_message_format:
    structure:
      id: "unique_message_id"
      source: "whatsapp|discord|slack"
      tenant: "tenant_identifier"
      content:
        text: "message text"
        media: ["array of media urls"]
        metadata: {}
      timestamp: "ISO 8601"
      
  routing_improvements:
    - Consistent message format across channels
    - Improved webhook handling
    - Better error recovery
    - Transaction logging
    
  api_endpoints:
    - POST /messages/unified
    - GET /messages/history/{tenant_id}
    - POST /webhooks/evolution
    - POST /webhooks/discord
```

## Evolution API Integration

### Webhook Configuration
```python
@app.post("/webhooks/evolution/{tenant_id}")
async def handle_evolution_webhook(
    tenant_id: str,
    payload: dict,
    background_tasks: BackgroundTasks
):
    """Handle incoming Evolution API webhooks"""
    
    # Validate webhook signature
    if not validate_signature(payload):
        raise HTTPException(401, "Invalid signature")
    
    # Process message types
    if payload["event"] == "messages.upsert":
        message = normalize_whatsapp_message(payload)
        
        # Forward to Hive if enabled
        if OMNI_TO_HIVE_ENABLED:
            background_tasks.add_task(
                forward_to_hive,
                tenant_id,
                message
            )
        
        return {"status": "accepted"}
```

### Instance Management
```bash
# Create new WhatsApp instance
POST /instances/create
{
  "instanceName": "business_account_1",
  "webhook": "http://omni:8882/webhooks/evolution/tenant_1",
  "qrcode": true
}

# Connect instance (scan QR)
GET /instances/qr/{instance_id}

# Send message
POST /messages/send
{
  "instance": "business_account_1",
  "to": "5511999999999",
  "text": "Hello from Omni Hub"
}
```

## Database Schema

### SQLite Configuration (Default)
```sql
-- Multi-tenant message storage
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    source TEXT NOT NULL,
    direction TEXT CHECK(direction IN ('inbound', 'outbound')),
    content JSON NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    config JSON NOT NULL,
    evolution_instance TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
);

CREATE TABLE webhooks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(id),
    url TEXT NOT NULL,
    events JSON,
    active BOOLEAN DEFAULT true
);
```

## Configuration

### Environment Variables
```env
# Core Settings
AUTOMAGIK_OMNI_API_PORT=8882
AUTOMAGIK_OMNI_API_HOST=0.0.0.0

# Database
AUTOMAGIK_OMNI_SQLITE_DATABASE_PATH=./data/automagik-omni.db

# Evolution Integration
EVOLUTION_API_BASE_URL=http://localhost:8084
EVOLUTION_API_KEY=namastex-key-8888
EVOLUTION_WEBHOOK_URL=http://localhost:8882/webhooks/evolution

# Hive Integration
OMNI_TO_HIVE_ENABLED=true
HIVE_API_URL=http://localhost:8886
HIVE_API_KEY=your-hive-key

# Media Handling
USE_BASE64_MEDIA=true
AUTOMAGIK_OMNI_MEDIA_MAX_SIZE=50MB
AUTOMAGIK_OMNI_MEDIA_DOWNLOAD_TIMEOUT=30
```

## API Endpoints

### Core Endpoints
```yaml
endpoints:
  instances:
    POST /instances/create: Create new WhatsApp instance
    GET /instances/{id}: Get instance details
    DELETE /instances/{id}: Remove instance
    
  messages:
    POST /messages/send: Send message
    GET /messages/history: Get message history
    POST /messages/unified: Unified message handler (PR #25)
    
  webhooks:
    POST /webhooks/evolution: Evolution API webhook
    POST /webhooks/discord: Discord webhook
    POST /webhooks/slack: Slack webhook
    
  management:
    GET /health: Health check
    GET /metrics: Performance metrics
    GET /tenants: List all tenants
```

## Tracing & Monitoring

### Message Tracing
```python
class MessageTracer:
    """Track message flow through system"""
    
    def __init__(self):
        self.traces = []
        self.retention_days = 30
        
    async def trace_message(self, message: dict):
        """Add trace entry for message"""
        trace = {
            "message_id": message["id"],
            "timestamp": datetime.utcnow(),
            "tenant": message.get("tenant_id"),
            "source": message.get("source"),
            "direction": message.get("direction"),
            "status": message.get("status"),
            "metadata": self.sanitize_metadata(message)
        }
        
        if ENABLE_TRACING:
            await self.store_trace(trace)
            
    def sanitize_metadata(self, message):
        """Remove sensitive data from traces"""
        if not TRACE_INCLUDE_SENSITIVE:
            # Remove phone numbers, message content
            return {k: v for k, v in message.items() 
                   if k not in ["content", "phone", "email"]}
        return message
```

## Integration with Hive

### Message Forwarding
```python
async def forward_to_hive(tenant_id: str, message: dict):
    """Forward normalized message to Hive for AI processing"""
    
    hive_payload = {
        "tenant": tenant_id,
        "message": message,
        "context": await get_tenant_context(tenant_id),
        "routing_hints": {
            "preferred_agent": determine_agent_type(message),
            "priority": calculate_priority(message),
            "session_id": get_or_create_session(tenant_id, message)
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HIVE_API_URL}/process",
            json=hive_payload,
            headers={"Authorization": f"Bearer {HIVE_API_KEY}"}
        )
        
    return response.json()
```

## Performance Optimization

### Concurrent Request Handling
```yaml
performance:
  max_concurrent_requests: 50
  request_timeout: 30
  uvicorn_workers: 4
  uvicorn_limit_concurrency: 100
  
  caching:
    tenant_cache_ttl: 300
    message_batch_size: 100
    
  memory_management:
    max_memory_usage: 2GB
    memory_check_interval: 300
```

---
*Technology documented: September 25, 2025*  
*Critical: Requires PR #25 for unified messaging*