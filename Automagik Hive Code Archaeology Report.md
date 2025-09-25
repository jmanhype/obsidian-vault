# Automagik Hive - Code Archaeology Report
**Date**: 2025-01-28
**Repository**: https://github.com/namastexlabs/automagik-hive
**Analyzed Branch**: dev (latest)
**Commit**: 0b35827 (refactor(knowledge): major architectural restructure)

## Executive Summary

Automagik Hive is an enterprise multi-agent AI framework built on Agno that enables "vibe coding" - transforming natural language into production AI systems. The project is actively developed with a recent major refactoring of the knowledge system and has clear contribution opportunities in testing, infrastructure, and documentation.

## Repository Structure

### Core Statistics
- **Version**: 0.1.1b2 (beta)
- **Language**: Python (100%)
- **Package Manager**: UV (not pip)
- **Framework**: Built on Agno (3μs agent instantiation, 6.5KB memory per agent)
- **License**: MIT

### Architectural Overview

```
automagik-hive/
├── ai/                      # Multi-agent core
│   ├── agents/             # Individual agents
│   ├── teams/              # Team orchestration
│   └── workflows/          # Business workflows
├── api/                    # FastAPI integration
│   ├── serve.py           # Production server
│   └── main.py            # Dev playground
├── lib/                    # Shared services
│   ├── config/            # Settings management
│   ├── knowledge/         # CSV-based RAG (recently refactored)
│   ├── auth/              # API authentication
│   └── versioning/        # Component versions
├── cli/                    # CLI commands
├── common/                 # Shared utilities
├── genie/                  # Autonomous workspace
│   ├── wishes/            # Active tasks/planning
│   ├── ideas/             # Brainstorms
│   ├── experiments/       # Prototypes
│   └── knowledge/         # Accumulated wisdom
└── tests/                  # Test suite (needs work)
```

## Key Technologies & Patterns

### 1. Vibe Coding Philosophy
- Write natural language instructions that become functional code
- Agents interpret "vibes" and translate to implementation
- Example: "Create a Slack notification agent" → Full agent implementation

### 2. Multi-Agent Architecture
- **Three Layers**: Genie Team → Domain Orchestrators → Execution Layer
- **Agent Types**: 16+ specialized agents (dev-coder, testing-maker, quality-ruff, etc.)
- **Team Coordination**: Routing logic for multi-agent collaboration
- **Workflow Orchestration**: Business process automation

### 3. DEATH TESTAMENT Pattern
- Complete lifecycle documentation for every agent task
- Embedded final reports in wish documents
- Evidence-based results with concrete proof
- Full audit trail preservation

### 4. Behavioral Vaccination
- Anti-pattern prevention system
- Violation tracking and cross-agent updates
- Critical rules enforced:
  - No time estimation (weeks/days/hours)
  - Always use UV for Python operations
  - Never modify pyproject.toml directly

### 5. Knowledge System (Recently Refactored)
```
lib/knowledge/
├── datasources/       # CSV data handling
├── factories/        # Knowledge creation
├── filters/          # Business unit filtering
├── repositories/     # Data abstraction
└── services/        # Change analysis & hashing
```

## Recent Development Activity

### Latest Commits (dev branch)
1. **0b35827**: Major knowledge system architectural restructure
2. **ab8cfe1**: Knowledge hot reload fix
3. **529dc75**: Remove duplicate manual registration
4. **0205850**: Complete single-instance architecture cleanup
5. **edf318a**: Replace psycopg[c] with psycopg[binary]

### Active Wishes/Tasks
1. `graceful-shutdown-enhancement.md` - Fix resource leak warnings
2. `cli-folder-reorganization-*.md` - CLI architecture refactoring
3. `knowledge-system-cleanup.md` - Recently completed
4. `readme-transformation-plan.md` - Documentation overhaul
5. `workflow-yaml-elimination.md` - Simplification effort
6. `workspace-surgical-refactor-tsd.md` - Architecture planning

## Contribution Opportunities

### HIGH PRIORITY - Test Suite Implementation
**Problem**: Many test files contain only TODO comments
**Impact**: Critical for project stability and CI/CD
**Files Needing Tests**:
- `tests/ai/tools/test_registry.py`
- `tests/ai/agents/tools/test_code_understanding_toolkit.py`
- `tests/ai/teams/template-team/test_team.py`
- `tests/integration/cli/*` (need DockerManager updates)

**Example TODO**:
```python
def test_agent_initialization():
    # TODO: Implement test for agent initialization
    pass
```

### MEDIUM PRIORITY - Graceful Shutdown
**Problem**: Resource leak warnings on shutdown
```
UserWarning: resource_tracker: There appear to be 1 leaked semaphore objects
```
**Solution**: Implement Langflow-style shutdown with:
- FastAPI lifespan context manager
- Progress display during shutdown phases
- Proper cleanup of async tasks and connections

### MEDIUM PRIORITY - CLI Architecture Updates
**Problem**: Tests reference old service modules
**Solution**: Update to use new `cli.docker_manager.DockerManager`
**Affected Tests**:
- `test_service_management.py`
- `test_postgres_integration.py`
- `test_workspace_commands.py`

### LOW PRIORITY - Documentation
**Opportunity**: Transform README into interactive guide
**File**: `genie/wishes/readme-transformation-plan.md`
**Goal**: Create compelling, example-driven documentation

## Development Workflow

### Environment Setup
```bash
# Clone and checkout dev branch
git clone https://github.com/namastexlabs/automagik-hive
cd automagik-hive
git checkout dev

# Install dependencies (MUST use UV, not pip)
uv sync

# Start development server
make dev &  # Runs on http://localhost:8886

# Alternative start command
uv run automagik-hive --dev &
```

### Testing Commands
```bash
# Run all tests
uv run pytest

# Run specific test categories
uv run pytest tests/agents/
uv run pytest tests/workflows/
uv run pytest tests/api/

# Run with coverage
uv run pytest --cov=ai --cov=api --cov=lib

# Linting and formatting
uv run ruff check --fix
uv run mypy .
```

### API Endpoints
```bash
# Health check
curl http://localhost:8886/api/v1/health

# Swagger documentation
curl http://localhost:8886/docs

# Playground endpoints
curl http://localhost:8886/playground/status
curl http://localhost:8886/playground/agents
curl http://localhost:8886/playground/teams
curl http://localhost:8886/playground/workflows

# Test agent execution
curl -X POST http://localhost:8886/playground/teams/genie/runs \
  -H "Content-Type: application/json" \
  -d '{"task_description": "Test functionality"}'
```

## Critical Rules & Conventions

### 1. UV Package Management
```bash
# ALWAYS use UV commands
uv add <package>          # Add dependency
uv add --dev <package>    # Add dev dependency
uv sync                   # Install all dependencies

# NEVER use
pip install <package>     # FORBIDDEN
```

### 2. File Organization
- Small focused files (<350 lines)
- Single responsibility principle
- Separation of concerns
- Composition over inheritance

### 3. Testing Requirements
- Every new agent needs unit and integration tests
- Use `@pytest.mark.asyncio` for async tests
- Mock external services (MCP tools, databases)
- Test with real YAML configs

### 4. No Time Estimations
- NEVER estimate weeks/days/hours
- Use "Phase 1", "Phase 2" instead
- We execute in minutes/seconds via orchestration

### 5. Protected Files
- `pyproject.toml` is READ-ONLY for agents
- Use UV commands for dependency changes
- Configuration via .env and YAML files

## Value Proposition for $1k/month Contribution

### Immediate Impact Areas
1. **Test Coverage** (40+ hours of work needed)
   - Implement missing tests
   - Add integration test suite
   - Set up CI/CD pipeline

2. **Infrastructure** (20+ hours)
   - Fix graceful shutdown
   - Complete CLI refactoring
   - Improve error handling

3. **Documentation** (10+ hours)
   - Create developer guides
   - Document agent creation
   - API usage examples

### Expected Deliverables
- 2-3 PRs per week
- Focus on test coverage first
- Complete in-progress wishes
- Add integration tests for new features

## Project Philosophy

### Core Principles
1. **KISS/YAGNI/DRY** - Simple, focused code
2. **No backward compatibility** - Clean implementations
3. **Evidence-based results** - Concrete proof required
4. **Fail fast, fail gracefully** - Robust error handling
5. **Industry-standard libraries** - No reinventing wheels

### Agent Development Cycle
```
User Request → /wish command → wishes/ document
→ hive-dev-planner (TSD) → hive-dev-designer (DDD)
→ hive-dev-coder (implementation) → hive-testing-maker (tests)
→ DEATH TESTAMENT (completion report)
```

## Contact & Collaboration

### Project Team
- **Felipe Rosa** (@namastexlabs) - Project Lead
- **Discord**: Active development discussions
- **GitHub Issues**: Feature requests and bugs

### Getting Started
1. Fork the repository
2. Create feature branch from `dev`
3. Implement tests or features
4. Submit PR with clear description
5. Ensure all tests pass

## Notes for Jay (batmanosama)

### Your Strengths Alignment
- **Testing**: Major need, high impact
- **Infrastructure**: Graceful shutdown, CLI work
- **Documentation**: Transform complex system into clear guides

### Recommended First PR
1. Pick ONE test file with TODOs
2. Implement comprehensive test coverage
3. Ensure tests pass with `uv run pytest`
4. Submit focused PR

### Time Investment
- 10-15 hours/week = $1k value
- Focus on test suite first (highest ROI)
- Complete existing wishes before new features

---

*Report compiled from comprehensive code archaeology performed on 2025-01-28*
*Repository state: dev branch at commit 0b35827*