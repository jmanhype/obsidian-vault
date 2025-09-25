# Rube MCP Architecture

**Repository**: https://github.com/ComposioHQ/Rube
**Platform**: Composio (https://composio.dev)
**Type**: Universal Tool Orchestration via MCP
**Scale**: 500+ integrations across SaaS platforms

## Zero-Entropy Architecture

Rube implements a **universal tool abstraction layer** that transforms natural language into API calls across 500+ business applications. It achieves:

1. **Semantic Intent Mapping** - Plain English → API operations
2. **Unified Authentication** - OAuth 2.1, API keys, custom auth
3. **Cross-Platform Consistency** - Works with any MCP-compatible client
4. **Team Collaboration** - Shared connections and credentials

## Core Architectural Patterns

### 1. Universal Tool Gateway
```
User Intent → Rube MCP → Composio Platform → Target API
     ↑                                            ↓
     └──────────── Result Translation ───────────┘
```

### 2. MCP Transport Types

#### StreamableHTTP (Cursor)
```json
{
  "name": "rube",
  "type": "streamableHttp",
  "url": "https://rube.composio.dev/?agent=cursor"
}
```

#### HTTP Transport (Claude Desktop)
```
URL: https://rube.app/mcp
Type: Custom Connector
```

#### NPX Setup (VS Code)
```bash
npx @composio/mcp@latest setup "https://rube.app/mcp" "rube" --client vscode
```

#### CLI Registration (Claude Code)
```bash
claude mcp add --transport http rube -s user "https://rube.app/mcp"
```

### 3. Authentication Flow
1. **Initial Connection** - MCP client connects to Rube
2. **OAuth Redirect** - Browser-based authentication
3. **Token Storage** - Encrypted end-to-end
4. **Scope Management** - Per-app permissions
5. **Team Sharing** - Optional credential sharing

## Tool Abstraction Layer

### Semantic Translation
Natural language commands translate to specific API calls:

```
"Send email to latest customer" →
  1. Query Airtable for latest customer
  2. Extract email address
  3. Compose message
  4. Send via Gmail API
```

### Multi-Step Workflows
Rube chains operations across applications:

```
"Find last 5 customers and notify team" →
  1. Airtable: Query customers
  2. Transform: Format data
  3. Slack: Post to channel
```

## Integration Categories

### Communication
- Gmail, Outlook, Slack, Discord, Teams

### Project Management  
- Linear, Jira, Asana, Monday.com, ClickUp

### Documentation
- Notion, Confluence, Google Docs, Dropbox Paper

### Development
- GitHub, GitLab, Bitbucket, CircleCI

### Data & Analytics
- Airtable, Google Sheets, Tableau, Snowflake

### CRM & Sales
- Salesforce, HubSpot, Pipedrive, Intercom

## Security Architecture

### 1. Token Management
- No credential storage on Composio servers
- End-to-end encryption for tokens
- OAuth 2.1 compliance
- SOC 2 certified infrastructure

### 2. Access Control
- Fine-grained permissions per tool
- User-level access management
- Team-based sharing policies
- Audit logging

### 3. Execution Isolation
- Sandboxed API calls
- Rate limiting protection
- Error boundary handling
- Rollback capabilities

## Zero-Entropy Insights

### 1. **Tool Normalization is Semantic Reduction**
Rube reduces the complexity of 500+ APIs to a single semantic interface. This is the same pattern as [[Unified Optimization Pattern]] - selective reduction with semantic preservation.

### 2. **MCP as Universal Protocol**
Like [[Claude Swarm Architecture]], Rube uses MCP as the communication layer, but instead of agent-to-agent, it's agent-to-tools.

### 3. **Authentication as Context**
OAuth flows preserve user context across tool boundaries, similar to session management in swarm systems.

### 4. **Composability Through Abstraction**
By abstracting tools behind a uniform interface, Rube enables composition of workflows that would be impossible with direct API integration.

## Architectural Comparison

### Rube vs Claude Swarm
- **Rube**: Agent → Tools (vertical integration)
- **Claude Swarm**: Agent → Agents (horizontal orchestration)
- **Common**: MCP protocol, session management, authentication

### Rube vs CORAL
- **Rube**: External tool orchestration
- **CORAL**: Internal agent collaboration
- **Common**: Semantic preservation, capability matching

### Rube vs DSPy
- **Rube**: Deterministic tool execution
- **DSPy**: Probabilistic prompt optimization
- **Common**: Natural language interface

## Implementation Patterns

### 1. Tool Discovery
```python
# Implicit discovery through natural language
"Send an email" → Discovers Gmail, Outlook options
"Create a task" → Discovers Linear, Jira, Asana
```

### 2. Context Preservation
```python
# Multi-step operations maintain context
context = {
    "customer": airtable.get_latest(),
    "email": gmail.compose(context.customer),
    "notification": slack.post(context.email)
}
```

### 3. Error Recovery
```python
try:
    result = tool.execute(params)
except AuthError:
    # Re-authenticate
    auth.refresh()
    result = tool.execute(params)
except RateLimitError:
    # Backoff and retry
    wait(backoff_time)
    result = tool.execute(params)
```

## Team Collaboration Model

### Connection Sharing
- **Personal**: Individual OAuth tokens
- **Shared**: Team-wide credentials
- **Mixed**: Some personal, some shared

### Permission Hierarchy
```
Organization
  ├── Teams
  │   ├── Shared Connections
  │   └── Role-based Access
  └── Individuals
      ├── Personal Connections
      └── Custom Permissions
```

## Performance Optimization

### 1. **Caching Layer**
- Recent API responses cached
- Token refresh minimization
- Batch operation support

### 2. **Parallel Execution**
- Independent operations run concurrently
- Pipeline optimization for dependent tasks

### 3. **Smart Routing**
- Closest API endpoint selection
- Load balancing across services

## Connection to Vault Patterns

### Universal Patterns
- [[Unified Optimization Pattern]] - Tool complexity reduction
- [[Law of Semantic Feedback]] - Natural language efficiency
- [[Swarm Orchestration Pattern]] - Tool as specialized agents

### Multi-Agent Integration
- [[Multi-Agent Convergence]] - Tools as leaf nodes in hierarchy
- [[CORAL Pattern]] - Collaborative tool composition
- [[Pareto Frontier Evolution]] - Tool selection optimization

## Future Architecture Evolution

### 1. **Agentic Tools**
Tools become semi-autonomous agents that can:
- Self-optimize API calls
- Learn usage patterns
- Suggest workflow improvements

### 2. **Semantic Tool Discovery**
- Intent-based tool recommendation
- Automatic workflow generation
- Cross-tool optimization

### 3. **Distributed Execution**
- Edge deployment of common tools
- Regional API routing
- Offline capability caching

## Key Insights

1. **Rube proves tools are just specialized agents** - Each integration is effectively a highly specialized agent for a specific API

2. **MCP enables vertical and horizontal scaling** - Same protocol works for agent-agent (Claude Swarm) and agent-tool (Rube) communication

3. **Semantic interfaces eliminate integration complexity** - Natural language becomes the universal API

4. **Authentication is orthogonal to functionality** - Credentials flow through the system without coupling to business logic

---

*Rube demonstrates that tool orchestration is agent orchestration with deterministic execution*