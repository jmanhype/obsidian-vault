# Consulting Delivery System

A comprehensive system for tracking and managing consulting projects through maturity levels with integrated knowledge management, pattern recognition, and automated decision support.

## System Overview

The Consulting Delivery System guides projects through five maturity levels:
**POC → MVP → PILOT → PRODUCTION → SCALE**

Each transition includes:
- **L1/L2/L3 Hardening Specifications** (Security/Reliability/Scalability)
- **Human Decision Gates** with structured approval workflows
- **Automated Payment Gate Triggers** tied to milestone completion
- **Deep Obsidian Integration** for knowledge management and institutional memory

## Quick Start

### Prerequisites

- Node.js 18+
- Obsidian vault
- Claude API access
- MCP-compatible environment

### Installation

1. **Clone and Setup**
```bash
cd /path/to/obsidian-vault
git clone <repository> consulting-system
cd consulting-system
```

2. **Install Dependencies**
```bash
cd mcp-servers/obsidian-mcp
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys and paths
```

4. **Configure MCP**
Update your Claude Code `.mcp.json`:
```json
{
  "mcpServers": {
    "obsidian-mcp": {
      "command": "node",
      "args": ["./consulting-system/mcp-servers/obsidian-mcp/server.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/your/vault",
        "NODE_ENV": "development"
      }
    }
  }
}
```

5. **Initialize System**
```bash
node src/scripts/initialize-system.js
```

### First Project

1. **Create Project**
```javascript
// Using MCP tools in Claude Code
create_project_note({
  projectData: {
    projectId: "client-project-001",
    clientName: "Acme Corp",
    projectName: "Digital Transformation Platform",
    projectType: "web_application",
    description: "Modern web platform for client operations"
  }
});
```

2. **Assess Maturity Level**
The MaturityEngine automatically assesses current project maturity and identifies requirements for advancement.

3. **Track Progress**
All progress, decisions, and patterns are automatically captured in your Obsidian vault with rich linking and context preservation.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Consulting Delivery System                   │
├─────────────────────────────────────────────────────────────────┤
│  Claude Agents Layer                                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐   │
│  │ Architect   │ Orchestrator│ Implementer │ Quality Gate    │   │
│  │ Agent       │ Agent       │ Agent       │ Agent           │   │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Core System Components                                        │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐   │
│  │ Maturity    │ Context     │ Pattern     │ Obsidian        │   │
│  │ Tracker     │ Engine      │ Recognition │ Integration     │   │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. MaturityEngine (`src/maturity-tracker/`)
- **Purpose**: Core progression logic through maturity levels
- **Responsibilities**: Level assessment, requirement validation, transition management
- **Key Features**: Automated gate validation, payment triggers, decision workflow

#### 2. ProjectContextManager (`src/context-engine/`)
- **Purpose**: Rich contextual understanding of project state
- **Responsibilities**: Context aggregation, decision support, historical analysis
- **Key Features**: Multi-source context, temporal tracking, pattern integration

#### 3. DeliveryPatternAnalyzer (`src/pattern-recognition/`)
- **Purpose**: Learn from historical delivery patterns
- **Responsibilities**: Success factor identification, risk prediction, recommendations
- **Key Features**: Statistical analysis, confidence scoring, actionable insights

#### 4. VaultManager (`src/obsidian-integration/`)
- **Purpose**: Seamless Obsidian vault integration
- **Responsibilities**: Note management, linking, knowledge graph operations
- **Key Features**: Template-based generation, automated linking, structured search

### Decision Gates

Human decision points are positioned at critical transitions:

```
POC ──[Gate 1]──▶ MVP ──[Gate 2]──▶ PILOT ──[Gate 3]──▶ PRODUCTION ──[Gate 4]──▶ SCALE
25%             50%             75%                100%
```

Each gate includes:
- **Automated Validation**: L1/L2/L3 requirements check
- **Human Approval**: Structured decision workflow
- **Payment Trigger**: Automated billing integration
- **Knowledge Capture**: Decision rationale and context

## Usage Guide

### Working with Projects

#### Create a New Project
```javascript
// Via MCP in Claude Code
create_project_note({
  projectData: {
    projectId: "unique-id",
    clientName: "Client Name",
    projectName: "Project Name",
    projectType: "web_application", // or api_development, mobile_app, etc.
    description: "Project description",
    objectives: ["Objective 1", "Objective 2"],
    stakeholders: [
      { role: "Product Owner", name: "John Doe", contact: "john@client.com" }
    ]
  },
  templateType: "project-overview" // optional
});
```

#### Assess Project Maturity
```javascript
// The system automatically assesses maturity
// Access via MaturityEngine in your code:
const assessment = await maturityEngine.assessCurrentLevel("project-id");
console.log(`Current level: ${assessment.currentLevel}`);
console.log(`Confidence: ${assessment.confidence}`);
console.log(`Next steps: ${assessment.blockers}`);
```

#### Initiate Level Transition
```javascript
const transition = await maturityEngine.initiateTransition("project-id", "MVP");
if (transition.status === 'AWAITING_APPROVAL') {
  // Decision gate created, stakeholders notified
  console.log(`Decision gate ID: ${transition.decisionGateId}`);
}
```

### Knowledge Management

#### Query Project Patterns
```javascript
query_knowledge_graph({
  query: {
    type: 'patterns',
    projectId: 'project-id',
    limit: 10
  }
});
```

#### Link Related Notes
```javascript
link_notes({
  sourceNote: "Projects/Client/Project.md",
  targetNote: "Methodologies/maturity-framework.md",
  linkType: "methodology"
});
```

### Pattern Recognition

#### Analyze Success Factors
```javascript
const analyzer = new DeliveryPatternAnalyzer(obsidian, contextEngine);
const factors = await analyzer.identifySuccessFactors('web_application', 'fintech');
```

#### Predict Risks
```javascript
const context = await contextEngine.buildProjectContext('project-id');
const risks = await analyzer.predictDeliveryRisks(context);
```

## Configuration

### Environment Variables

```bash
# Required
OBSIDIAN_VAULT_PATH=/path/to/obsidian/vault
ANTHROPIC_API_KEY=your-claude-api-key

# Optional
PERPLEXITY_API_KEY=your-perplexity-key  # For research features
NODE_ENV=development
LOG_LEVEL=info
```

### Maturity Level Configuration

Customize hardening requirements in `src/maturity-tracker/MaturityEngine.js`:

```javascript
this.hardeningRequirements = {
  POC: {
    security: ['basic_auth'],
    reliability: ['manual_testing'],
    scalability: ['single_instance']
  },
  // ... customize for your needs
};
```

### Payment Gate Configuration

Configure payment percentages and requirements:

```javascript
this.paymentGates = {
  POC_TO_MVP: { 
    percentage: 25, 
    milestone: 'poc_validation',
    requirements: ['poc_demo', 'stakeholder_approval']
  },
  // ... customize payment structure
};
```

## Obsidian Integration

### Vault Structure

The system creates and maintains this structure in your Obsidian vault:

```
consulting-system/
├── Projects/
│   ├── {client-name}/
│   │   ├── {project-name}.md
│   │   ├── {project-name}/
│   │   │   ├── artifacts/
│   │   │   ├── decision-history/
│   │   │   └── hardening-specs/
├── Methodologies/
│   ├── maturity-frameworks/
│   └── hardening-specifications/
├── Patterns/
│   ├── delivery-patterns/
│   └── success-patterns/
└── Templates/
    ├── project-templates/
    └── decision-gate-templates/
```

### Note Templates

#### Project Overview Template
- Project metadata and status
- Maturity level progression
- L1/L2/L3 requirements tracking
- Stakeholder information
- Decision history links

#### Decision Gate Template
- Gate validation results
- Approval workflow status
- Payment gate information
- Risk assessments
- Historical context

### Knowledge Graph

The system automatically creates and maintains links between:

- **Projects ↔ Methodologies**: Applied frameworks and processes
- **Projects ↔ Patterns**: Historical patterns and lessons learned
- **Decisions ↔ Context**: Decision rationale and supporting information
- **Stakeholders ↔ Projects**: Relationship and communication history

## API Reference

### MCP Tools

#### Project Management
- `create_project_note(projectData, templateType)`: Create new project
- `update_project_note(projectId, updates)`: Update project information
- `get_project_maturity_history(projectId)`: Get maturity progression

#### Decision Gates
- `create_decision_gate_note(decisionGate)`: Create decision gate
- `query_knowledge_graph(query)`: Query knowledge relationships

#### Knowledge Management
- `link_notes(sourceNote, targetNote, linkType)`: Link related notes
- `export_context_snapshot(projectId)`: Export complete context

### Core Classes

#### MaturityEngine
```javascript
const engine = new MaturityEngine(contextEngine, patternRecognition, obsidian);

// Assess current maturity level
await engine.assessCurrentLevel(projectId);

// Validate level requirements
await engine.validateLevelRequirements(projectId, targetLevel);

// Initiate transition
await engine.initiateTransition(projectId, targetLevel);

// Record human decision
await engine.recordDecision(projectId, decision);
```

#### ProjectContextManager
```javascript
const contextManager = new ProjectContextManager(obsidian, patternRecognition);

// Build comprehensive context
await contextManager.buildProjectContext(projectId);

// Update context with changes
await contextManager.updateContext(projectId, contextDelta);

// Get decision-specific context
await contextManager.getContextForDecision(projectId, decisionType);
```

#### DeliveryPatternAnalyzer
```javascript
const analyzer = new DeliveryPatternAnalyzer(obsidian, contextEngine);

// Analyze project patterns
await analyzer.analyzeProjectPatterns(projectId);

// Identify success factors
await analyzer.identifySuccessFactors(projectType, clientType);

// Predict risks
await analyzer.predictDeliveryRisks(projectContext);

// Recommend next steps
await analyzer.recommendNextSteps(projectId, currentLevel);
```

## Extending the System

### Adding New Maturity Levels

1. Update `MaturityEngine.maturityLevels`
2. Define hardening requirements
3. Create decision gate templates
4. Update payment gate configuration

### Custom Hardening Requirements

1. Extend `hardeningRequirements` in MaturityEngine
2. Implement validation logic in `_validateLevelRequirements`
3. Update note templates with new requirements

### Integration with External Systems

1. Create new integration modules in `src/integrations/`
2. Implement MCP tools for external access
3. Update context aggregation in ProjectContextManager

### Custom Pattern Recognition

1. Extend DeliveryPatternAnalyzer with domain-specific patterns
2. Implement custom similarity algorithms
3. Add industry-specific success factors

## Troubleshooting

### Common Issues

#### MCP Connection Problems
```bash
# Check MCP server status
node mcp-servers/obsidian-mcp/server.js

# Verify configuration
cat .mcp.json
```

#### Obsidian Integration Issues
```bash
# Check vault permissions
ls -la $OBSIDIAN_VAULT_PATH

# Verify note creation
node -e "console.log(require('./src/obsidian-integration/VaultManager.js'))"
```

#### Context Engine Problems
```bash
# Check context building
node -e "
const ContextManager = require('./src/context-engine/ProjectContextManager.js');
// Debug context aggregation
"
```

### Logging and Debugging

Enable debug logging:
```bash
export LOG_LEVEL=debug
export NODE_ENV=development
```

View system logs:
```bash
tail -f system.log
```

## Contributing

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start development server: `npm run dev`

### Code Standards

- Use ESLint configuration
- Write tests for new components
- Document all public APIs
- Follow existing naming conventions

### Submitting Changes

1. Create feature branch
2. Write tests
3. Update documentation
4. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: See `/docs` for detailed guides
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: support@consulting-system.com

---

*Consulting Delivery System - Structured project progression with integrated knowledge management*