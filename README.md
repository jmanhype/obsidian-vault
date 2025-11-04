# Obsidian Knowledge Vault

A comprehensive personal knowledge management system built with Obsidian, featuring automated deployment, health monitoring, and containerized operations.

## 🌟 Features

- **Knowledge Management**: Organized collection of patterns, principles, laws, and technical knowledge
- **Automated Deployment**: CI/CD pipelines for building and deploying documentation
- **Health Monitoring**: Automated vault health checks and repair systems
- **Containerized Operations**: Docker and Dagger-based tooling for reproducible builds
- **Documentation Generation**: Automatic generation of static websites, PDFs, and EPUB books

## 📁 Structure

```
.
├── Databases/              # Organized knowledge base
│   ├── Knowledge Base/     # Technical documentation and guides
│   ├── Patterns/          # Design patterns and best practices
│   ├── Principles/        # Development principles
│   ├── Laws/              # Fundamental laws and theories
│   ├── Frameworks/        # Framework documentation
│   └── Projects/          # Project documentation
├── Scripts/               # Automation and utility scripts
├── Templates/             # Note templates for consistency
├── .github/               # GitHub Actions workflows
└── vault-outputs/         # Generated documentation outputs
```

## 🚀 Quick Start

### Prerequisites

- [Obsidian](https://obsidian.md/) for local vault management
- Docker for containerized operations
- Python 3.8+ for automation scripts
- Node.js for MCP server operations (optional)

### Local Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/obsidian-vault.git
cd obsidian-vault
```

2. Open the vault in Obsidian:
   - Launch Obsidian
   - Choose "Open folder as vault"
   - Select the cloned directory

3. Install dependencies (optional, for automation):
```bash
# For Python scripts
pip install -r requirements.txt  # If you create one

# For Node.js MCP servers
cd consulting-system && npm install
```

## 🛠️ Automation Scripts

### Vault Health Monitoring

Check vault health and identify issues:

```bash
# Run health check
python3 Scripts/vault-health-check.py

# Containerized health check
python3 Scripts/containerized-health-check.py

# Auto-repair issues
python3 Scripts/vault-auto-repair.py --dry-run
```

### Documentation Generation

Build documentation in multiple formats:

```bash
# Build all outputs (website, PDF, EPUB)
./build-vault-outputs.sh

# Deploy to Coolify
./deploy-to-coolify.sh
```

### Backup Management

```bash
# Create smart backup with deduplication
python3 Scripts/smart-backup.py

# View backup dashboard
python3 Scripts/vault-dashboard.py
```

## 📊 Documentation Outputs

The vault automatically generates documentation in multiple formats:

- **Static Website**: MkDocs-powered searchable site
- **PDF Book**: Complete knowledge base as PDF
- **EPUB**: E-reader compatible format
- **Searchable Portal**: Full-text search enabled documentation

Build outputs are stored in `vault-outputs/` directory.

## 🔄 CI/CD Integration

This repository includes GitHub Actions workflows for:

- **Self-Improvement**: Automated code review and improvement using Claude Code
- **Automated Deployment**: Build and publish documentation on commits
- **Health Monitoring**: Scheduled vault health checks

See `.github/workflows/` for workflow configurations.

## 🐳 Containerized Operations

The vault supports containerized operations using Apollo Dagger MCP:

```bash
# Build with Dagger
python3 Scripts/apollo-dagger-cicd.py

# Multi-project builds
python3 Scripts/dagger-multi-build.py

# Container vault operations
python3 Scripts/container-vault-operations.py
```

## 📝 Content Organization

### Knowledge Base Categories

- **Patterns**: Reusable design patterns and architectural approaches
- **Principles**: Core development and design principles (YAGNI, DRY, etc.)
- **Laws**: Fundamental laws (Conway's Law, Gall's Law, etc.)
- **Frameworks**: Framework-specific documentation (DSPy, Three Gulfs, etc.)
- **Projects**: Active and archived project documentation

### Note Templates

Templates are available in the `Templates/` directory for:
- Knowledge entries
- Project documentation
- Meeting notes
- Book summaries
- Pattern documentation
- Client profiles (for consulting system)

## 🤖 AI Integration

The vault integrates with various AI systems:

- **Task Master AI**: Automated task management and tracking
- **Claude Code**: Autonomous code review and improvement
- **MCP Servers**: Custom Model Context Protocol servers for Obsidian operations

See `CLAUDE.md` and `.taskmaster/` for AI integration documentation.

## 🔧 Configuration Files

- `.mcp.json`: Model Context Protocol server configuration
- `mkdocs.yml`: Documentation site configuration
- `docker-compose.coolify.yml`: Coolify deployment configuration
- `.env.example`: Environment variable template
- `.gitignore`: Git ignore patterns

## 📚 Key Documentation

- [Apollo Dagger Integration](Databases/Knowledge%20Base/Apollo%20Dagger%20Integration.md)
- [Vault Automation Summary](Databases/Knowledge%20Base/Vault%20Automation%20Summary.md)
- [Claude Flow Architecture](Claude%20Flow%20-%20Master%20Architecture%20Documentation.md)
- [TaskMaster Pattern](Databases/Patterns/TaskMaster%20Obsidian%20Kanban%20Pattern.md)

## 🤝 Contributing

This is a personal knowledge vault, but suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss proposed changes.

## 📄 License

This vault contains personal notes and documentation. Code and scripts are provided as-is for reference and reuse.

## 🔗 Related Projects

- [Obsidian](https://obsidian.md/) - The knowledge base application
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) - Documentation theme
- [Dagger](https://dagger.io/) - Containerized CI/CD toolkit
- [Task Master AI](https://github.com/Codemethemoney/task-master-ai) - AI-powered task management

## 📧 Contact

For questions or suggestions, please open an issue in this repository.

---

*Last updated: 2024-11-04*
*Automated builds and deployments powered by Apollo Dagger MCP*
