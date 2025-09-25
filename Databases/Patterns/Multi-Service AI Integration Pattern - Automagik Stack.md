# Multi-Service AI Integration Pattern - Automagik Stack

## Pattern Overview
**Type**: Microservice Integration Pattern  
**Category**: AI Orchestration with Messaging  
**Example Implementation**: Automagik Hive + Omni + Evolution  
**Complexity**: High  

## Pattern Structure

### Service Layer Architecture
```yaml
pattern_layers:
  messaging_ingress:
    services: ["Evolution API", "Discord Bot", "Slack App"]
    responsibility: "Capture messages from external platforms"
    
  message_normalization:
    services: ["Omni Hub"]
    responsibility: "Unify message formats across channels"
    
  ai_orchestration:
    services: ["Hive Orchestrator"]
    responsibility: "Route to appropriate AI agents"
    
  execution_layer:
    services: ["Claude Sub-agents", "MCP Tools"]
    responsibility: "Process and generate responses"
```

## Implementation Blueprint

### 1. Message Ingress Setup
```python
class MessageIngress:
    """Capture messages from multiple sources"""
    
    def __init__(self):
        self.sources = {
            "whatsapp": EvolutionAPIConnector(),
            "discord": DiscordBotConnector(),
            "slack": SlackAppConnector()
        }
        
    async def setup_webhooks(self):
        """Configure all webhook endpoints"""
        for source_name, connector in self.sources.items():
            webhook_url = f"{BASE_URL}/webhooks/{source_name}"
            await connector.register_webhook(webhook_url)
```

### 2. Message Normalization
```python
class MessageNormalizer:
    """Convert platform-specific messages to unified format"""
    
    UNIFIED_SCHEMA = {
        "id": str,
        "source": str,
        "tenant": str,
        "content": {
            "text": str,
            "media": list,
            "metadata": dict
        },
        "timestamp": datetime
    }
    
    def normalize(self, source: str, raw_message: dict) -> dict:
        """Transform to unified format"""
        normalizers = {
            "whatsapp": self.normalize_whatsapp,
            "discord": self.normalize_discord,
            "slack": self.normalize_slack
        }
        
        return normalizers[source](raw_message)
```

### 3. AI Orchestration Layer
```python
class AIOrchestrator:
    """Route messages to appropriate AI agents"""
    
    def __init__(self):
        self.router = IntentClassifier()
        self.agents = AgentPool()
        
    async def process_message(self, message: dict):
        """Main orchestration logic"""
        # 1. Classify intent
        intent = await self.router.classify(message)
        
        # 2. Select appropriate agent team
        team = self.select_team(intent)
        
        # 3. Execute via sub-agents
        response = await self.execute_with_agents(team, message)
        
        # 4. Format response for source platform
        return self.format_response(message["source"], response)
```

## Configuration Template

### Docker Compose Pattern
```yaml
version: '3.8'

services:
  # Data Layer
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      
  redis:
    image: redis:7
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      
  # Message Queue
  rabbitmq:
    image: rabbitmq:management
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      
  # Messaging Services
  evolution-api:
    image: evolution-api:latest
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_healthy}
      
  # Orchestration Services
  omni-hub:
    build: ./omni
    depends_on:
      evolution-api: {condition: service_healthy}
      
  hive-orchestrator:
    build: ./hive
    depends_on:
      omni-hub: {condition: service_healthy}
      postgres: {condition: service_healthy}
```

### Environment Configuration Pattern
```env
# Service Discovery
SERVICE_REGISTRY_URL=http://registry:8500

# Inter-Service Communication
MESSAGE_BUS=rabbitmq://user:pass@rabbitmq:5672
CACHE_LAYER=redis://redis:6379

# API Gateways
EVOLUTION_API_URL=http://evolution-api:8084
OMNI_HUB_URL=http://omni-hub:8882
HIVE_ORCHESTRATOR_URL=http://hive:8886

# Security
SERVICE_AUTH_TOKEN=${SERVICE_AUTH_TOKEN}
WEBHOOK_SECRET=${WEBHOOK_SECRET}
```

## Integration Patterns

### Webhook Registration Pattern
```python
class WebhookManager:
    """Manage webhook lifecycle"""
    
    async def register_all_webhooks(self):
        """Register webhooks for all services"""
        registrations = [
            {
                "service": "evolution",
                "url": f"{OMNI_URL}/webhooks/evolution",
                "events": ["messages.upsert", "connection.update"]
            },
            {
                "service": "discord",
                "url": f"{OMNI_URL}/webhooks/discord",
                "events": ["MESSAGE_CREATE", "MESSAGE_UPDATE"]
            }
        ]
        
        for reg in registrations:
            await self.register_webhook(**reg)
```

### Circuit Breaker Pattern
```python
class ServiceCircuitBreaker:
    """Prevent cascade failures"""
    
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        
    async def call(self, func, *args, **kwargs):
        """Execute with circuit breaker protection"""
        if self.state == "OPEN":
            if self.should_attempt_reset():
                self.state = "HALF_OPEN"
            else:
                raise ServiceUnavailableError()
                
        try:
            result = await func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise
```

### Message Retry Pattern
```python
class MessageRetryHandler:
    """Handle failed message processing"""
    
    def __init__(self):
        self.retry_queue = asyncio.Queue()
        self.max_retries = 3
        self.backoff_multiplier = 2
        
    async def process_with_retry(self, message: dict):
        """Process message with exponential backoff"""
        attempt = 0
        delay = 1
        
        while attempt < self.max_retries:
            try:
                return await self.process_message(message)
            except Exception as e:
                attempt += 1
                if attempt >= self.max_retries:
                    await self.dead_letter_queue(message, e)
                    raise
                    
                await asyncio.sleep(delay)
                delay *= self.backoff_multiplier
```

## Deployment Sequence

### Correct Service Startup Order
```bash
#!/bin/bash
# deployment-sequence.sh

echo "Starting data layer..."
docker-compose up -d postgres redis rabbitmq

echo "Waiting for data services..."
./wait-for-it.sh postgres:5432
./wait-for-it.sh redis:6379
./wait-for-it.sh rabbitmq:5672

echo "Starting Evolution API..."
docker-compose up -d evolution-api
./wait-for-it.sh evolution-api:8084

echo "Starting Omni Hub..."
docker-compose up -d omni-hub
./wait-for-it.sh omni-hub:8882

echo "Starting Hive Orchestrator..."
docker-compose up -d hive-orchestrator
./wait-for-it.sh hive-orchestrator:8886

echo "All services started successfully!"
```

## Monitoring & Observability

### Health Check Pattern
```python
class ServiceHealthMonitor:
    """Monitor all service health statuses"""
    
    async def check_all_services(self):
        """Comprehensive health check"""
        health_status = {
            "timestamp": datetime.utcnow(),
            "services": {}
        }
        
        checks = [
            ("postgres", self.check_postgres),
            ("redis", self.check_redis),
            ("rabbitmq", self.check_rabbitmq),
            ("evolution", self.check_evolution),
            ("omni", self.check_omni),
            ("hive", self.check_hive)
        ]
        
        for service_name, check_func in checks:
            try:
                health_status["services"][service_name] = {
                    "status": "healthy",
                    "details": await check_func()
                }
            except Exception as e:
                health_status["services"][service_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                
        return health_status
```

### Distributed Tracing
```python
class DistributedTracer:
    """Track message flow across services"""
    
    def create_trace_context(self, message_id: str):
        """Create trace context for message"""
        return {
            "trace_id": generate_trace_id(),
            "span_id": generate_span_id(),
            "message_id": message_id,
            "timestamp": datetime.utcnow(),
            "service_hops": []
        }
        
    async def trace_service_hop(self, context: dict, service: str):
        """Add service hop to trace"""
        context["service_hops"].append({
            "service": service,
            "timestamp": datetime.utcnow(),
            "span_id": generate_span_id()
        })
        
        # Send to tracing backend
        await self.send_to_jaeger(context)
```

## Common Pitfalls & Solutions

### Problem: Service Discovery Failures
```python
# Solution: Implement service registry
class ServiceRegistry:
    def __init__(self):
        self.services = {}
        self.health_checks = {}
        
    async def register_service(self, name: str, url: str):
        """Register service with health check"""
        self.services[name] = url
        self.health_checks[name] = asyncio.create_task(
            self.monitor_health(name, url)
        )
```

### Problem: Message Duplication
```python
# Solution: Idempotency keys
class IdempotencyHandler:
    def __init__(self):
        self.processed_messages = TTLCache(maxsize=10000, ttl=3600)
        
    async def process_once(self, message_id: str, processor):
        """Ensure message processed only once"""
        if message_id in self.processed_messages:
            return self.processed_messages[message_id]
            
        result = await processor()
        self.processed_messages[message_id] = result
        return result
```

### Problem: Cascading Failures
```python
# Solution: Bulkhead pattern
class BulkheadExecutor:
    def __init__(self, max_concurrent=10):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
    async def execute(self, func, *args, **kwargs):
        """Execute with concurrency limit"""
        async with self.semaphore:
            return await func(*args, **kwargs)
```

## Performance Optimization

### Connection Pooling
```python
class ConnectionPoolManager:
    """Manage connection pools for all services"""
    
    def __init__(self):
        self.pools = {
            "postgres": create_postgres_pool(),
            "redis": create_redis_pool(),
            "http": create_http_pool()
        }
        
    async def get_connection(self, service: str):
        """Get connection from pool"""
        return await self.pools[service].acquire()
```

### Caching Strategy
```python
class MultiLevelCache:
    """Implement L1/L2 caching"""
    
    def __init__(self):
        self.l1_cache = {}  # In-memory
        self.l2_cache = RedisCache()  # Redis
        
    async def get(self, key: str):
        """Get from cache with fallthrough"""
        # Check L1
        if key in self.l1_cache:
            return self.l1_cache[key]
            
        # Check L2
        value = await self.l2_cache.get(key)
        if value:
            self.l1_cache[key] = value
            return value
            
        return None
```

---
*Pattern documented: September 25, 2025*  
*Example: Automagik Stack Integration*