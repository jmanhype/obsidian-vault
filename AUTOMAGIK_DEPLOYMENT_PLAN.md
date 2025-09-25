# Automagik Full Stack Deployment Plan

## Felipe's Requirements
Deploy hive (dev) + omni (dev) + WhatsApp locally with Discord integration to achieve agent responses on both channels.

## System Architecture

```mermaid
graph TB
    WhatsApp[WhatsApp Users] --> Evolution[Evolution API :8080]
    Discord[Discord Users] --> DiscordBot[Discord Bot]
    
    Evolution --> Omni[Omni Hub :8882]
    DiscordBot --> Omni
    
    Omni --> Hive[Hive Agents :8886]
    Hive --> AI[AI Models]
    
    Hive --> Omni
    Omni --> Evolution
    Omni --> DiscordBot
    
    Evolution --> WhatsApp
    DiscordBot --> Discord
```

## Step-by-Step Deployment

### Phase 1: Evolution API Setup (WhatsApp Backend)

1. **Configure Evolution Environment**
   ```bash
   cd automagik-evolution
   cp .env.example .env
   # Edit .env with:
   # - SERVER_PORT=8080
   # - AUTHENTICATION_API_KEY=your_evolution_key
   # - DATABASE_CONNECTION_URI=postgresql://evolution_user:namastex8888@postgres:5432/evolution_db
   ```

2. **Start Evolution Services**
   ```bash
   docker-compose up -d
   # Services: PostgreSQL, Redis, RabbitMQ, Evolution API
   ```

3. **Verify Evolution**
   - API: http://localhost:8080
   - Docs: http://localhost:8080/docs
   - RabbitMQ: http://localhost:15672 (user: namastex, pass: namastex8888)

### Phase 2: Hive Setup (Agent System)

1. **Configure Hive Environment**
   ```bash
   cd ../automagik-hive
   git checkout dev  # CRITICAL: Use dev branch
   cp .env.example .env
   # Edit .env with:
   # - HIVE_API_PORT=8886
   # - HIVE_DATABASE_URL=postgresql+psycopg://hive_user:password@localhost:5532/hive
   # - AI provider keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
   # - HIVE_API_KEY=your_hive_key
   ```

2. **Install Dependencies**
   ```bash
   uv sync  # or pip install -e .
   ```

3. **Start Hive**
   ```bash
   # Option A: Docker
   docker compose -f docker/main/docker-compose.yml up -d
   
   # Option B: Local development
   uv run automagik-hive dev
   ```

4. **Create Test Agent**
   ```bash
   # Create ai/agents/test-agent/config.yaml
   mkdir -p ai/agents/test-agent
   cat > ai/agents/test-agent/config.yaml << EOF
   agent:
     name: "Test Assistant"
     agent_id: "test-agent"
     
   instructions: |
     You are a helpful assistant responding via Omni.
     Be concise and friendly.
   EOF
   ```

### Phase 3: Omni Setup (Channel Hub)

1. **Configure Omni Environment**
   ```bash
   cd ../automagik-omni
   git checkout dev
   git pull origin pull/25/head  # CRITICAL: Get PR #25 changes
   
   cp .env.example .env
   # Edit .env with:
   # - AUTOMAGIK_OMNI_API_PORT=8882
   # - AUTOMAGIK_OMNI_API_KEY=namastex888
   # - AUTOMAGIK_OMNI_SQLITE_DATABASE_PATH=./data/automagik-omni.db
   ```

2. **Install Dependencies**
   ```bash
   pip install -e ".[discord]"  # Include Discord support
   ```

3. **Initialize Database**
   ```bash
   automagik-omni migrate
   ```

4. **Start Omni API**
   ```bash
   automagik-omni serve
   # API runs on http://localhost:8882
   ```

### Phase 4: Create Instance Configurations

1. **Create WhatsApp Instance**
   ```bash
   curl -X POST http://localhost:8882/api/v1/instances \
     -H "x-api-key: namastex888" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "whatsapp-bot",
       "channel_type": "whatsapp",
       "evolution_url": "http://localhost:8080",
       "evolution_api_key": "your_evolution_key",
       "agent_url": "http://localhost:8886/v1/agents/test-agent/run",
       "agent_api_key": "your_hive_key"
     }'
   ```

2. **Get WhatsApp QR Code**
   ```bash
   curl http://localhost:8882/api/v1/instances/whatsapp-bot/qr \
     -H "x-api-key: namastex888"
   # Scan with WhatsApp
   ```

3. **Create Discord Instance**
   ```bash
   curl -X POST http://localhost:8882/api/v1/instances \
     -H "x-api-key: namastex888" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "discord-bot",
       "channel_type": "discord",
       "discord_token": "YOUR_DISCORD_BOT_TOKEN",
       "agent_url": "http://localhost:8886/v1/agents/test-agent/run",
       "agent_api_key": "your_hive_key"
     }'
   ```

4. **Start Discord Bot**
   ```bash
   automagik-omni discord start discord-bot
   ```

### Phase 5: Forge Setup (Optional Task Queue)

```bash
# Install and run Forge for task management
npx automagik-forge@0.3.9 serve
```

## Environment Variables Summary

### Evolution (.env)
```bash
SERVER_PORT=8080
DATABASE_CONNECTION_URI=postgresql://evolution_user:namastex8888@postgres:5432/evolution_db
AUTHENTICATION_API_KEY=evo_key_12345
RABBITMQ_URI=amqp://namastex:namastex8888@rabbitmq:5672
```

### Hive (.env)
```bash
HIVE_API_PORT=8886
HIVE_DATABASE_URL=postgresql+psycopg://hive_user:password@localhost:5532/hive
HIVE_API_KEY=hive_key_12345
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
HIVE_DEV_MODE=true
```

### Omni (.env)
```bash
AUTOMAGIK_OMNI_API_PORT=8882
AUTOMAGIK_OMNI_API_KEY=namastex888
AUTOMAGIK_OMNI_SQLITE_DATABASE_PATH=./data/automagik-omni.db
LOG_LEVEL=INFO
```

## Verification Steps

1. **Test WhatsApp**
   - Send message to connected WhatsApp number
   - Check Omni logs for incoming webhook
   - Verify Hive agent processing
   - Confirm response sent back

2. **Test Discord**
   - Send message in Discord channel with bot
   - Check Omni logs for Discord event
   - Verify same Hive agent responds
   - Confirm response in Discord

3. **Check Traces**
   ```bash
   curl http://localhost:8882/api/v1/traces \
     -H "x-api-key: namastex888"
   ```

## Common Issues & Solutions

### Issue: Evolution API not receiving messages
- Check WhatsApp connection status
- Verify webhook URL in Evolution instance
- Check RabbitMQ is running

### Issue: Omni not routing to Hive
- Verify agent_url in instance config
- Check Hive API is accessible
- Verify API keys match

### Issue: Discord bot not responding
- Check bot token is valid
- Verify bot has message permissions
- Check Discord bot process is running

### Issue: Hive agent not processing
- Check AI provider keys are set
- Verify agent config exists
- Check PostgreSQL connection

## Success Criteria

✅ WhatsApp messages trigger Hive agent responses  
✅ Discord messages trigger same Hive agent responses  
✅ Both channels show consistent agent behavior  
✅ Message tracing shows full flow  
✅ No errors in any service logs  

## Next Steps After Deployment

1. Create more sophisticated agents in Hive
2. Implement team routing for multi-agent scenarios
3. Add Slack and other channels via Omni
4. Set up monitoring and analytics
5. Configure production deployment

---

**Note**: This deployment creates a local development environment. For production, additional security, scaling, and monitoring configurations are required.