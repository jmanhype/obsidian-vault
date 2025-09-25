# MCP Servers Configuration

**Type**: AI-Tool Integration Protocol
**Released**: 2024 (Anthropic)
**Purpose**: Connect AI assistants to data sources and tools
**Key Innovation**: Standardized two-way communication between AI and systems

## Overview

The Model Context Protocol (MCP) is an open standard created by Anthropic that enables secure, two-way connections between AI assistants (like Claude) and external data sources, tools, and APIs. It standardizes how AI systems interact with the broader ecosystem of software tools.

## Architecture

### Core Components

```
MCP Client (Claude) ←→ MCP Protocol ←→ MCP Server (Tool/Data)
         ↓                    ↓                    ↓
    AI Assistant         JSON-RPC          External System
```

### Communication Flow

```javascript
// MCP server exposes resources
{
  "resources": [
    {
      "uri": "file:///project/README.md",
      "name": "Project README",
      "mimeType": "text/markdown"
    }
  ],
  "tools": [
    {
      "name": "execute_query",
      "description": "Run SQL query",
      "inputSchema": {...}
    }
  ]
}
```

## Configuration Methods

### 1. JSON Configuration (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    },
    "database": {
      "command": "node",
      "args": ["/path/to/database-server.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    }
  }
}
```

### 2. Project-Level Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "project-tools": {
      "command": "python",
      "args": ["./mcp-server/server.py"],
      "env": {
        "PROJECT_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

### 3. Desktop Extensions (DXT) - 2024 Update

```bash
# One-click installation
claude install mcp-server-filesystem
claude install mcp-server-github
claude install mcp-server-postgres
```

## Configuration Scopes

### 1. Local Scope (Project-Specific)
```json
// .mcp.json in project root
{
  "mcpServers": {
    "local-tool": {
      "command": "./local-server",
      "args": ["--project", "."]
    }
  }
}
```

### 2. User Scope (Personal)
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "personal-notes": {
      "command": "node",
      "args": ["~/tools/notes-server.js"]
    }
  }
}
```

### 3. System Scope (Organization)
```json
// /etc/claude/mcp-servers.json
{
  "mcpServers": {
    "company-data": {
      "command": "docker",
      "args": ["run", "company/mcp-server:latest"]
    }
  }
}
```

## Pre-built MCP Servers

### Official Servers
```bash
# Filesystem access
npx -y @modelcontextprotocol/server-filesystem /path

# GitHub integration
npx -y @modelcontextprotocol/server-github

# PostgreSQL
npx -y @modelcontextprotocol/server-postgres

# Slack
npx -y @modelcontextprotocol/server-slack

# Google Drive
npx -y @modelcontextprotocol/server-gdrive

# Git
npx -y @modelcontextprotocol/server-git
```

### Custom Server Example

```python
# Python MCP server
from mcp import Server, Tool, Resource

class CustomMCPServer(Server):
    def __init__(self):
        super().__init__("custom-server")
        
    @Tool("search_database")
    def search_database(self, query: str):
        # Implementation
        return results
        
    @Resource("file:///data/config.json")
    def get_config(self):
        return {"content": json_data}

if __name__ == "__main__":
    server = CustomMCPServer()
    server.run()
```

## Platform-Specific Configuration

### macOS/Linux
```json
{
  "mcpServers": {
    "tool": {
      "command": "python3",
      "args": ["/usr/local/bin/server.py"]
    }
  }
}
```

### Windows (Native)
```json
{
  "mcpServers": {
    "tool": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-tool"]
    }
  }
}
```

### Docker Container
```json
{
  "mcpServers": {
    "containerized": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--network", "host",
        "mcp-server:latest"
      ]
    }
  }
}
```

## Security Best Practices

### 1. Environment Variables
```json
{
  "mcpServers": {
    "secure-server": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "${SECURE_API_KEY}",
        "DATABASE_URL": "${DATABASE_CONNECTION}"
      }
    }
  }
}
```

### 2. Permission Scoping
```javascript
// Server implementation
class SecureMCPServer {
  constructor() {
    this.permissions = {
      read: ["allowed/paths/*"],
      write: ["specific/directory"],
      execute: ["safe_commands"]
    };
  }
}
```

### 3. Authentication
```python
# OAuth-protected server
class AuthenticatedServer(MCPServer):
    def authenticate(self, token):
        # Verify OAuth token
        return verify_oauth_token(token)
```

## Troubleshooting

### Common Issues

```bash
# Connection closed error
# Solution: Check command path and arguments

# Windows npx issue
# Solution: Use cmd /c wrapper

# Permission denied
# Solution: Check file permissions and paths

# Environment variable not found
# Solution: Export variables or use .env file
```

### Debug Mode
```json
{
  "mcpServers": {
    "debug-server": {
      "command": "node",
      "args": ["--inspect", "server.js"],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

## Advanced Configuration

### Multi-Server Setup
```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    },
    "files": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "custom": {
      "command": "python",
      "args": ["./custom_server.py"]
    }
  }
}
```

### Dynamic Configuration
```javascript
// Generate configuration based on environment
const config = {
  mcpServers: {}
};

if (process.env.NODE_ENV === 'development') {
  config.mcpServers.dev = {
    command: 'npm',
    args: ['run', 'mcp-dev']
  };
}

fs.writeFileSync('.mcp.json', JSON.stringify(config, null, 2));
```

## Integration Examples

### Task Master Integration
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key",
        "PERPLEXITY_API_KEY": "your_key"
      }
    }
  }
}
```

### Apollo Dagger Integration
```json
{
  "mcpServers": {
    "apollo-dagger": {
      "command": "node",
      "args": ["./apollo-mcp/server.js"],
      "env": {
        "DAGGER_SESSION": "session_token"
      }
    }
  }
}
```

## Zero-Entropy Insights

### 1. **Protocol Over Implementation**
MCP defines the protocol, not the implementation details.

### 2. **Bidirectional Is Key**
Two-way communication enables true collaboration.

### 3. **Security Through Isolation**
Each server runs in its own process with controlled permissions.

### 4. **Extensibility By Design**
Any tool can become MCP-compatible with a wrapper.

## Related

- [[Apollo MCP Server]]
- [[Dagger CI-CD]]
- [[GraphQL Integration]]
- [[Container Orchestration]]
- [[Task Master Integration]]

---

*"MCP: The universal adapter for AI-tool integration"*