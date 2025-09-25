---
type: pattern
category: infrastructure
entropy: low
language_agnostic: true
tags: [pattern, containers, documentation, mkdocs, apollo, dagger, mcp]
use_cases: [documentation-sites, static-generation, containerized-workflows]
date_documented: 2025-01-23
---

# Container-Based Documentation Generation Pattern

## Intent
Generate static documentation websites from markdown vaults using containerized toolchains, eliminating local dependencies and ensuring reproducible builds.

## Motivation
- **Zero Local Dependencies**: No need to install MkDocs, Hugo, or other generators
- **Reproducibility**: Same container = same output every time
- **Version Control**: All configuration tracked in repository
- **Cross-Platform**: Works identically on any OS with container runtime

## Structure

```
MCP Server (Apollo Dagger)
    ↓
Container Runtime (Dagger)
    ↓
Documentation Container (MkDocs/Hugo/Sphinx)
    ↓
Static Site Output
```

## Implementation

### 1. Container-Based Tool Installation
Instead of local installation:
```bash
# Traditional (requires local environment)
pip install mkdocs mkdocs-material

# Container-based (via Apollo Dagger MCP)
ContainerFrom("python:3.11")
ContainerWithExec(["pip", "install", "mkdocs", "mkdocs-material"])
```

### 2. Configuration as Code
Store configuration in version control:
```yaml
# mkdocs.yml
site_name: My Documentation
theme:
  name: material
nav:
  - Home: index.md
  - Guides: guides/
```

### 3. Build Process
Containerized build ensures consistency:
```javascript
// Via MCP tools
mcp__apollo-dagger__ContainerWithExec({
  args: ["mkdocs", "build", "--site-dir", "/output"]
})
```

### 4. Directory Mapping
```
Source/              # Your markdown files
├── docs/           # Documentation root
├── mkdocs.yml      # Configuration
└── output/         # Generated site
```

## Example: Obsidian → MkDocs

We used this pattern to create a documentation site from Obsidian vault:

1. **Source**: `/Databases/` folders with markdown
2. **Configuration**: `mkdocs.yml` with Material theme
3. **Container**: Python with MkDocs installed
4. **Output**: Static site in `vault-outputs/website/`

## Advantages

1. **Isolation**: Documentation tools don't pollute local environment
2. **Versioning**: Pin specific container versions for stability
3. **Parallel Builds**: Run multiple documentation generators simultaneously
4. **CI/CD Ready**: Same containers work in pipelines
5. **Tool Agnostic**: Swap MkDocs for Hugo/Sphinx without local changes

## Variations

### Multi-Tool Documentation
Run different generators for different outputs:
```javascript
// PDF generation
ContainerFrom("pandoc/latex")
ContainerWithExec(["pandoc", "*.md", "-o", "docs.pdf"])

// Website generation
ContainerFrom("klakegg/hugo")
ContainerWithExec(["hugo", "--minify"])

// API docs
ContainerFrom("swaggerapi/swagger-ui")
ContainerWithExec(["generate", "-i", "api.yaml"])
```

### Watch Mode Development
Container with file watching:
```javascript
ContainerWithExec(["mkdocs", "serve", "--dev-addr=0.0.0.0:8000"])
// Maps to localhost:8000 for live preview
```

## Known Uses

- **Apollo Dagger MkDocs**: Generated documentation site from Obsidian vault
- **API Documentation**: Containerized Swagger/OpenAPI generation
- **Multi-Format Publishing**: Same source → Website, PDF, EPUB

## Related Patterns

- [[Natural Language Container Control Pattern]]
- [[TaskMaster Obsidian Kanban Pattern]]
- [[Infrastructure as Code Pattern]]

## Consequences

### Benefits
- ✅ No local tool installation required
- ✅ Guaranteed reproducible builds
- ✅ Easy team onboarding (just run container)
- ✅ Version control for all configuration

### Tradeoffs
- ⚠️ Requires container runtime (Docker/Dagger)
- ⚠️ Initial container download time
- ⚠️ More complex than direct tool usage
- ⚠️ Debugging may require container access

## Implementation Checklist

- [ ] Choose documentation generator (MkDocs, Hugo, Sphinx)
- [ ] Create container configuration
- [ ] Set up MCP server for container operations
- [ ] Configure source → output mapping
- [ ] Test build process
- [ ] Set up watch mode for development
- [ ] Document build commands

---
*Pattern Category: Infrastructure*
*Complexity: Medium*
*Reusability: High*