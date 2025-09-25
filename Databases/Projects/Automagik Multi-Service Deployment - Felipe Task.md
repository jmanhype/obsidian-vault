# Automagik Multi-Service Deployment - Felipe Task

## Project Overview
**Task Owner**: Felipe Rosa  
**Assigned To**: batmanosama  
**Date**: September 25, 2025  
**Priority**: CRITICAL - Production deployment  
**Status**: Investigation Complete, Deployment Pending  

## Executive Summary
Felipe has requested deployment of the complete Automagik ecosystem with specific branch configurations and integration requirements. This involves orchestrating three core services (Hive, Omni, Evolution) with WhatsApp and Discord integrations.

## Deployment Requirements

### Service Configuration Matrix
```yaml
services:
  automagik-hive:
    branch: dev
    version: latest-dev
    dependencies: ["PostgreSQL", "Redis", "MCP"]
    ports: [8886]
    
  automagik-omni:
    branch: dev + PR#25
    version: dev-with-unified-messaging
    dependencies: ["SQLite/PostgreSQL", "Evolution API"]
    ports: [8882]
    
  automagik-evolution:
    branch: main
    version: v2.3.2
    dependencies: ["PostgreSQL", "Redis", "RabbitMQ"]
    ports: [8084, 6379, 5672, 15672, 15432]
    
  automagik-forge:
    branch: main
    version: v0.3.9
    status: stable-no-changes-needed
```

## Technical Architecture

### Integration Flow
```
WhatsApp/Discord → Evolution API → Omni Hub → Hive Orchestrator → AI Agents
                                        ↓
                                  Unified Messaging
                                        ↓
                                  Response Routing
```

### Key Integration Points
1. **Evolution API**: WhatsApp backend provider
2. **Omni Hub**: Unified messaging interface with webhook system
3. **Hive Orchestrator**: Multi-agent AI coordination
4. **MCP Integration**: 87 tools across the system

## Deployment Steps Completed

### Investigation Phase ✅
- Cloned all repositories
- Analyzed branch structures
- Identified PR #25 requirements
- Mapped service dependencies

### Documentation Phase ✅
- Created deployment plan
- Documented configuration requirements
- Mapped integration architecture

## Pending Deployment Tasks

### Phase 1: Infrastructure Setup
```bash
# 1. Evolution API (Foundation)
cd automagik-evolution
cp .env.example .env
# Configure PostgreSQL, Redis, RabbitMQ
docker-compose up -d
```

### Phase 2: Core Services
```bash
# 2. Hive (Dev Branch)
cd ../automagik-hive
git checkout dev
cp .env.example .env
# Configure AI provider keys
uv sync
uv run automagik-hive api

# 3. Omni (Dev + PR #25)
cd ../automagik-omni
git checkout dev
git pull origin pull/25/head
cp .env.example .env
# Configure Evolution webhook
uv sync
uv run automagik-omni
```

### Phase 3: Integration Testing
1. Create WhatsApp instance via Evolution
2. Configure Omni webhook routing
3. Test message flow end-to-end
4. Verify Hive agent responses

## Critical Configuration

### Environment Variables Required
```env
# Evolution
AUTHENTICATION_API_KEY=namastex-key-8888
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://evolution_user:namastex8888@postgres:5432/evolution_db

# Omni
EVOLUTION_API_BASE_URL=http://localhost:8084
EVOLUTION_WEBHOOK_URL=http://localhost:8882/webhooks/evolution
OMNI_TO_HIVE_ENABLED=true

# Hive
HIVE_DEV_MODE=true
ANTHROPIC_API_KEY=required
OPENAI_API_KEY=required
```

## Success Metrics
- [ ] All services running without errors
- [ ] WhatsApp messages routed to Hive
- [ ] Discord integration functional
- [ ] Agent responses delivered correctly
- [ ] PR #25 unified messaging working

## Risk Factors
1. **Branch Instability**: Dev branches may have breaking changes
2. **PR #25 Compatibility**: Unmerged PR may conflict with dev
3. **Service Dependencies**: Complex inter-service communication
4. **API Key Requirements**: Multiple AI provider keys needed

## Communication Context
- Felipe expressed urgency: "I need to see measurable progress"
- Previous attempt was on wrong branch: "Dev doesnt even have genie agents anymore"
- Focus on production readiness: "System already has paying customers"

## Next Actions
1. Begin actual deployment following documented plan
2. Test each service individually before integration
3. Document any issues encountered
4. Report completion status to Felipe

---
*Investigation completed: September 25, 2025*  
*Deployment pending user confirmation*