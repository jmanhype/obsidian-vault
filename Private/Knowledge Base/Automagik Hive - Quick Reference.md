# Automagik Hive - Quick Reference

## Essential Commands

```bash
# Initialize new project
uvx automagik-hive init my-project

# Start server
uvx automagik-hive serve my-project

# Interactive chat
uvx automagik-hive chat my-project

# Validate agents
uvx automagik-hive validate my-project
```

## Agent Template

```yaml
name: agent_name
instructions: |
  Your role and responsibilities here.
  Be specific about capabilities.
```

## Available Agents (v0.1.10)

1. **coordinator** - Orchestrates
2. **researcher** - Gathers info
3. **code_writer** - Writes code
4. **debugger** - Fixes errors
5. **data_analyst** - Analyzes data
6. **project_manager** - Manages tasks
7. **report_writer** - Documents
8. **reviewer** - Reviews code
9. **file_manager** - Handles files

## Project Structure

```
my-project/
└── .automagik-hive/
    └── agents/
        └── *.yaml
```

## Custom Agent Example

```yaml
name: api_specialist
instructions: |
  You handle API integrations.
  You write clean REST clients.
  You manage authentication.
  You handle rate limiting.
model: gpt-4
temperature: 0.3
```

## Server Config

```yaml
# .automagik-hive/config.yaml
server:
  port: 8000
  host: 0.0.0.0
  reload: true
```

## Environment Variables

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="..."
export HIVE_WORKSPACE="/path/to/workspace"
```

## Troubleshooting

| Problem               | Solution             |
|-----------------------|----------------------|
| Templates not found   | Upgrade to v0.1.10+  |
| Server won't start    | Check port 8000      |
| Agents not responding | Check API keys       |
| YAML errors           | Run validate command |

## Key Files

- `pyproject.toml` - Package configuration
- `src/automagik_hive/cli.py` - CLI commands
- `src/automagik_hive/server.py` - FastAPI server
- `templates_included/agents/*.yaml` - Agent templates

## Version History

- **0.1.10** - Fixed UVX distribution ✅
- **0.1.9** - Initial release
- **0.1.0** - Beta

---
*Quick Reference v1.0 - December 2024*
EOF < /dev/null