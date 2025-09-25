# Evolution API - WhatsApp Business Integration

## Technology Overview
**Category**: WhatsApp Business API Provider  
**Type**: Self-hosted WhatsApp API Solution  
**Docker Image**: evoapicloud/evolution-api:v2.3.2  
**Repository**: automagik-evolution (Docker Compose setup)  
**Status**: Production Ready  

## Architecture Components

### Service Stack
```yaml
services:
  evolution-api:
    purpose: "WhatsApp Web API provider"
    port: 8084
    dependencies: ["PostgreSQL", "Redis", "RabbitMQ"]
    
  postgresql:
    purpose: "Message and session storage"
    port: 15432
    version: "15"
    
  redis:
    purpose: "Session caching and real-time data"
    port: 6379
    version: "7"
    
  rabbitmq:
    purpose: "Message queue for async processing"
    ports: [5672, 15672]
    version: "management"
```

## Docker Compose Configuration

### Complete Setup
```yaml
services:
  redis:
    image: redis:7
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - evolution_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  rabbitmq:
    image: rabbitmq:management
    container_name: rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: namastex
      RABBITMQ_DEFAULT_PASS: namastex8888
    ports:
      - "5672:5672"    
      - "15672:15672"  # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - evolution_network
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_DB: evolution_db
      POSTGRES_USER: evolution_user
      POSTGRES_PASSWORD: namastex8888
    volumes:
      - postgres_data:/var/lib/postgresql/data
    command: postgres -c max_connections=200
    networks:
      - evolution_network
    ports:
      - "15432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evolution_user -d evolution_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  evolution-api:
    image: evoapicloud/evolution-api:v2.3.2
    container_name: evolution_api
    restart: always
    ports:
      - "${SERVER_PORT}:${SERVER_PORT}"
    env_file:
      - .env
    depends_on:
      rabbitmq:
        condition: service_healthy
      postgres:
        condition: service_healthy
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution_network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  evolution_instances:

networks:
  evolution_network:
    driver: bridge
```

## API Capabilities

### Instance Management
```javascript
// Create WhatsApp Instance
POST /instance/create
{
  "instanceName": "business_account",
  "webhook": "http://omni:8882/webhooks/evolution",
  "webhookByEvents": true,
  "events": [
    "messages.upsert",
    "messages.update",
    "connection.update",
    "contacts.update"
  ],
  "qrcode": true
}

// Get QR Code for Connection
GET /instance/qr/{instanceName}
Response: Base64 encoded QR code image

// Check Connection Status
GET /instance/status/{instanceName}
Response: {
  "instance": "business_account",
  "state": "connected",
  "profileName": "Business Name",
  "profilePicUrl": "https://..."
}
```

### Message Operations
```javascript
// Send Text Message
POST /message/send-text
{
  "instance": "business_account",
  "to": "5511999999999@s.whatsapp.net",
  "text": "Hello from Evolution API"
}

// Send Media Message
POST /message/send-media
{
  "instance": "business_account",
  "to": "5511999999999@s.whatsapp.net",
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Check out this image"
}

// Send Location
POST /message/send-location
{
  "instance": "business_account",
  "to": "5511999999999@s.whatsapp.net",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "name": "São Paulo",
  "address": "São Paulo, Brazil"
}
```

## Webhook Events

### Event Types
```yaml
webhook_events:
  messages.upsert:
    description: "New message received"
    payload:
      instance: "business_account"
      messages:
        - key:
            remoteJid: "5511999999999@s.whatsapp.net"
            fromMe: false
            id: "message_id"
          message:
            conversation: "Message text"
          messageTimestamp: 1695600000
          
  connection.update:
    description: "Connection status change"
    payload:
      instance: "business_account"
      connection: "close|connecting|open"
      lastDisconnect:
        error: "Error details if disconnected"
        
  contacts.update:
    description: "Contact information update"
    payload:
      instance: "business_account"
      contacts:
        - id: "5511999999999@s.whatsapp.net"
          name: "Contact Name"
          notify: "Display Name"
```

## Environment Configuration

### Required Variables
```env
# Server Configuration
SERVER_URL=http://localhost:8084
SERVER_PORT=8084

# Database Configuration
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://evolution_user:namastex8888@postgres:5432/evolution_db

# Redis Configuration
CACHE_REDIS_URI=redis://redis:6379
CACHE_REDIS_PREFIX_KEY=evolution

# RabbitMQ Configuration
RABBITMQ_ENABLED=true
RABBITMQ_URI=amqp://namastex:namastex8888@rabbitmq:5672

# Authentication
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=namastex-key-8888

# Instance Configuration
INSTANCE_MAX_RETRY_QR=5
QRCODE_EXPIRE_IN=30
QRCODE_LIMIT=10

# Webhook Configuration
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_URL=
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false

# Storage
STORE_MESSAGES=true
STORE_MESSAGE_UP_TO=30
STORE_CONTACTS=true
STORE_CHATS=true

# Performance
WORKER_THREADS=10
```

## Integration with Omni

### Webhook Flow
```python
# Omni receives Evolution webhook
@app.post("/webhooks/evolution/{tenant_id}")
async def evolution_webhook(tenant_id: str, payload: dict):
    """Process Evolution API webhook"""
    
    if payload["event"] == "messages.upsert":
        for message in payload["messages"]:
            # Extract message details
            whatsapp_message = {
                "from": message["key"]["remoteJid"],
                "text": message["message"].get("conversation"),
                "media": extract_media(message),
                "timestamp": message["messageTimestamp"]
            }
            
            # Normalize and forward
            normalized = normalize_message(whatsapp_message)
            await forward_to_hive(tenant_id, normalized)
```

### Response Handling
```python
async def send_whatsapp_response(instance: str, to: str, response: dict):
    """Send response back via Evolution API"""
    
    evolution_url = f"{EVOLUTION_API_BASE_URL}/message/send-text"
    
    payload = {
        "instance": instance,
        "to": to,
        "text": response["text"]
    }
    
    headers = {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY
    }
    
    async with httpx.AsyncClient() as client:
        result = await client.post(
            evolution_url,
            json=payload,
            headers=headers
        )
    
    return result.json()
```

## Deployment Steps

### 1. Initial Setup
```bash
# Clone repository
git clone <automagik-evolution-repo>
cd automagik-evolution

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d
```

### 2. Health Verification
```bash
# Check all services are running
docker-compose ps

# Check Evolution API health
curl http://localhost:8084/health

# Access RabbitMQ Management
# http://localhost:15672
# Username: namastex
# Password: namastex8888
```

### 3. Create WhatsApp Instance
```bash
# Create instance via API
curl -X POST http://localhost:8084/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: namastex-key-8888" \
  -d '{
    "instanceName": "main_account",
    "webhook": "http://localhost:8882/webhooks/evolution",
    "qrcode": true
  }'

# Get QR code for scanning
curl http://localhost:8084/instance/qr/main_account \
  -H "apikey: namastex-key-8888"
```

## Monitoring & Management

### Health Checks
```yaml
monitoring:
  endpoints:
    /health: Overall API health
    /metrics: Performance metrics
    /instance/list: All active instances
    /instance/status/{name}: Specific instance status
    
  logs:
    location: /evolution/logs
    rotation: daily
    retention: 30 days
```

### Troubleshooting
```bash
# View logs
docker-compose logs evolution-api -f

# Restart specific service
docker-compose restart evolution-api

# Database connection issues
docker exec -it postgres psql -U evolution_user -d evolution_db

# Redis connection test
docker exec -it redis redis-cli ping

# RabbitMQ queue status
docker exec -it rabbitmq rabbitmqctl list_queues
```

---
*Technology documented: September 25, 2025*  
*Version: v2.3.2 (Production)*