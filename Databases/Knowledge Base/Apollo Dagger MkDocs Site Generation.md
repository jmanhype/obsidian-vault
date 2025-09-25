# Apollo Dagger MkDocs Site Generation

#mcp #dagger #mkdocs #documentation #containerization #apollo

## Overview

Complete documentation of how we used Apollo Dagger MCP (Model Context Protocol) to create a full MkDocs documentation website from the Obsidian vault through containerized operations.

## The Achievement

We successfully used **Apollo Dagger MCP** container operations to:
1. Set up a complete MkDocs environment
2. Configure Material theme with dark/light mode
3. Generate site structure from Obsidian vault
4. Create navigation mapping from `/Databases/` content
5. Build a searchable, browsable documentation website

## Architecture

```
Apollo Dagger MCP (GraphQL Interface)
    ↓
Container Operations (via Dagger)
    ↓
MkDocs Container Environment
    ↓
Site Generation & Configuration
    ↓
Static Website Output
```

## File Structure Created

```
/Users/speed/Documents/Obsidian Vault/
├── mkdocs.yml                 # MkDocs configuration
├── docs/                       # MkDocs documentation root
│   ├── index.md               # Landing page
│   └── Databases/             # Mirrored content structure
│       ├── Knowledge Base/
│       ├── Patterns/
│       ├── Principles/
│       ├── Laws/
│       ├── Projects/
│       └── Reading List/
├── Databases/                  # Source content (Obsidian vault)
│   ├── Knowledge Base/        # Actual markdown files
│   ├── Patterns/
│   ├── Principles/
│   ├── Laws/
│   ├── Projects/
│   └── Reading List/
└── vault-outputs/
    └── website/               # Built static site

```

## MkDocs Configuration

The `mkdocs.yml` we generated configures:

### Site Metadata
- **Name**: Obsidian Knowledge Vault
- **Author**: Speed
- **Output**: `vault-outputs/website`

### Material Theme Features
- Dark/Light mode toggle
- Navigation tabs and sections
- Search with suggestions and highlighting
- Code copying and annotations
- Table of contents with permalinks

### Content Mapping
Maps `/Databases/` folders to website navigation:
- Knowledge Base → Apollo Dagger guides, Vault automation
- Patterns → TaskMaster, Singleton, Container Control
- Principles → YAGNI, Make It Work, Natural Language
- Laws → Gall's Law, Conway's Law
- Reading List → Books and resources
- Projects → Active project documentation

## Container Operations Used

Through Apollo Dagger MCP, we executed:

1. **Environment Setup**
```graphql
ContainerFrom("python:3.11")
ContainerWithExec(["pip", "install", "mkdocs", "mkdocs-material"])
```

2. **Configuration Generation**
```graphql
ContainerWithExec(["mkdocs", "new", "."])
# Then modified mkdocs.yml with our configuration
```

3. **Site Building**
```graphql
ContainerWithExec(["mkdocs", "build"])
```

4. **Development Server** (optional)
```graphql
ContainerWithExec(["mkdocs", "serve", "--dev-addr=0.0.0.0:8000"])
```

## The Apollo Dagger Proxy Pattern

Key to making this work was the proxy pattern (documented in [[Apollo Dagger MCP Troubleshooting Guide]]):

1. **Dagger session** runs on dynamic port (e.g., 59066)
2. **HTTP proxy** on port 9999 with Basic Auth
3. **MCP server** connects through proxy
4. **Container operations** execute through GraphQL

## Benefits Achieved

1. **Fully Containerized**: No local MkDocs installation needed
2. **Reproducible**: Same containers = same output
3. **Version Controlled**: All configuration in vault
4. **Searchable Website**: Full-text search of all content
5. **Professional Presentation**: Material theme with navigation
6. **Cross-Platform**: Containers work anywhere

## Commands to Rebuild

Using Apollo Dagger MCP tools:
```javascript
// Build the site
mcp__apollo-dagger__ContainerFrom({address: "python:3.11"})
mcp__apollo-dagger__ContainerWithExec({args: ["mkdocs", "build"]})

// Serve locally
mcp__apollo-dagger__ContainerWithExec({args: ["mkdocs", "serve"]})
```

## Integration Points

- **Source**: Obsidian vault in `/Databases/`
- **Configuration**: `mkdocs.yml` at vault root
- **Entry Point**: `/docs/index.md`
- **Output**: `vault-outputs/website/`
- **Container Runtime**: Dagger via Apollo MCP

## Why This Matters

This demonstrates Apollo Dagger MCP's power beyond simple container operations:
- **Complex Workflows**: Multi-step documentation generation
- **Tool Integration**: Obsidian → MkDocs → Static Site
- **Infrastructure as Code**: All steps reproducible via MCP
- **No Local Dependencies**: Everything runs in containers

## Related Documentation

- [[Apollo Dagger MCP Troubleshooting Guide]] - Proxy setup and debugging
- [[Apollo Dagger Integration]] - Original integration notes
- [[Natural Language Container Control Pattern]] - The pattern we followed
- [[TaskMaster Obsidian Kanban Pattern]] - Similar automation pattern

## Files Created by This Process

- `/mkdocs.yml` - Main configuration
- `/docs/index.md` - Landing page
- `/docs/Databases/*` - Mirrored content structure
- `/vault-outputs/website/*` - Built static site

---
*Created: 2025-01-23*
*Status: Documented*
*Category: Infrastructure Achievement*