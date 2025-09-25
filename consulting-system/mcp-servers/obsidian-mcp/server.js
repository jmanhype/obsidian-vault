#!/usr/bin/env node

/**
 * Obsidian MCP Server
 * Provides Model Context Protocol interface to Obsidian vault operations
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const VaultManager = require('../../src/obsidian-integration/VaultManager.js');
// NoteTemplateEngine will be defined inline below

class ObsidianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'obsidian-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components
    const vaultPath = process.env.OBSIDIAN_VAULT_PATH || '/Users/speed/Documents/Obsidian Vault';
    this.templateEngine = new NoteTemplateEngine();
    this.vaultManager = new VaultManager(vaultPath, this.templateEngine);

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_project_note',
            description: 'Create a new project note in Obsidian vault',
            inputSchema: {
              type: 'object',
              properties: {
                projectData: {
                  type: 'object',
                  description: 'Project information',
                  properties: {
                    projectId: { type: 'string' },
                    clientName: { type: 'string' },
                    projectName: { type: 'string' },
                    projectType: { type: 'string' },
                    description: { type: 'string' },
                    objectives: { type: 'array', items: { type: 'string' } },
                    stakeholders: { type: 'array' },
                    constraints: { type: 'array' },
                    timeline: { type: 'object' }
                  },
                  required: ['projectId', 'clientName', 'projectName']
                },
                templateType: {
                  type: 'string',
                  description: 'Template type to use',
                  default: 'project-overview'
                }
              },
              required: ['projectData']
            }
          },
          {
            name: 'update_project_note',
            description: 'Update an existing project note',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project identifier' },
                updates: {
                  type: 'object',
                  description: 'Updates to apply to the note'
                }
              },
              required: ['projectId', 'updates']
            }
          },
          {
            name: 'create_decision_gate_note',
            description: 'Create a decision gate note for maturity transition',
            inputSchema: {
              type: 'object',
              properties: {
                decisionGate: {
                  type: 'object',
                  description: 'Decision gate information',
                  properties: {
                    id: { type: 'string' },
                    projectId: { type: 'string' },
                    targetLevel: { type: 'string' },
                    validation: { type: 'object' },
                    paymentGate: { type: 'object' },
                    created: { type: 'string' }
                  },
                  required: ['id', 'projectId', 'targetLevel']
                }
              },
              required: ['decisionGate']
            }
          },
          {
            name: 'link_notes',
            description: 'Create links between notes in vault',
            inputSchema: {
              type: 'object',
              properties: {
                sourceNote: { type: 'string', description: 'Source note path' },
                targetNote: { type: 'string', description: 'Target note path' },
                linkType: { 
                  type: 'string', 
                  description: 'Type of link relationship',
                  default: 'related'
                }
              },
              required: ['sourceNote', 'targetNote']
            }
          },
          {
            name: 'query_knowledge_graph',
            description: 'Query the Obsidian knowledge graph',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'object',
                  description: 'Query parameters',
                  properties: {
                    type: { 
                      type: 'string',
                      enum: ['related_projects', 'patterns', 'decisions', 'full_text']
                    },
                    projectId: { type: 'string' },
                    searchTerm: { type: 'string' },
                    timeRange: { type: 'string' },
                    limit: { type: 'number', default: 10 }
                  },
                  required: ['type']
                }
              },
              required: ['query']
            }
          },
          {
            name: 'get_project_maturity_history',
            description: 'Get maturity progression history for a project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project identifier' }
              },
              required: ['projectId']
            }
          },
          {
            name: 'export_context_snapshot',
            description: 'Export complete context snapshot for archival',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project identifier' }
              },
              required: ['projectId']
            }
          },
          {
            name: 'get_vault_structure',
            description: 'Get overview of vault structure and organization',
            inputSchema: {
              type: 'object',
              properties: {
                includeCounts: { 
                  type: 'boolean', 
                  description: 'Include note counts per section',
                  default: true
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_project_note':
            return await this.handleCreateProjectNote(args);
            
          case 'update_project_note':
            return await this.handleUpdateProjectNote(args);
            
          case 'create_decision_gate_note':
            return await this.handleCreateDecisionGateNote(args);
            
          case 'link_notes':
            return await this.handleLinkNotes(args);
            
          case 'query_knowledge_graph':
            return await this.handleQueryKnowledgeGraph(args);
            
          case 'get_project_maturity_history':
            return await this.handleGetMaturityHistory(args);
            
          case 'export_context_snapshot':
            return await this.handleExportContextSnapshot(args);
            
          case 'get_vault_structure':
            return await this.handleGetVaultStructure(args);
            
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async handleCreateProjectNote(args) {
    const { projectData, templateType = 'project-overview' } = args;
    
    const notePath = await this.vaultManager.createProjectNote(projectData, templateType);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project note created successfully at: ${notePath}`
        }
      ]
    };
  }

  async handleUpdateProjectNote(args) {
    const { projectId, updates } = args;
    
    await this.vaultManager.updateProjectNote(projectId, updates);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project note updated successfully for project: ${projectId}`
        }
      ]
    };
  }

  async handleCreateDecisionGateNote(args) {
    const { decisionGate } = args;
    
    const notePath = await this.vaultManager.createDecisionGateNote(decisionGate);
    
    return {
      content: [
        {
          type: 'text',
          text: `Decision gate note created successfully at: ${notePath}`
        }
      ]
    };
  }

  async handleLinkNotes(args) {
    const { sourceNote, targetNote, linkType = 'related' } = args;
    
    await this.vaultManager.linkNotes(sourceNote, targetNote, linkType);
    
    return {
      content: [
        {
          type: 'text',
          text: `Notes linked successfully: ${sourceNote} -> ${targetNote} (${linkType})`
        }
      ]
    };
  }

  async handleQueryKnowledgeGraph(args) {
    const { query } = args;
    
    const results = await this.vaultManager.queryKnowledgeGraph(query);
    
    return {
      content: [
        {
          type: 'text',
          text: `Knowledge graph query results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async handleGetMaturityHistory(args) {
    const { projectId } = args;
    
    const history = await this.vaultManager.getProjectMaturityHistory(projectId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Maturity history for ${projectId}:\n${JSON.stringify(history, null, 2)}`
        }
      ]
    };
  }

  async handleExportContextSnapshot(args) {
    const { projectId } = args;
    
    // This would integrate with ProjectContextManager
    const snapshot = {
      projectId,
      timestamp: new Date().toISOString(),
      message: 'Context snapshot functionality requires integration with ProjectContextManager'
    };
    
    return {
      content: [
        {
          type: 'text',
          text: `Context snapshot for ${projectId}:\n${JSON.stringify(snapshot, null, 2)}`
        }
      ]
    };
  }

  async handleGetVaultStructure(args) {
    const { includeCounts = true } = args;
    
    const structure = {
      vaultPath: this.vaultManager.vaultPath,
      structure: this.vaultManager.vaultStructure,
      message: 'Vault structure overview',
      timestamp: new Date().toISOString()
    };
    
    if (includeCounts) {
      structure.noteCounts = {
        projects: '(count not implemented)',
        methodologies: '(count not implemented)',
        patterns: '(count not implemented)',
        templates: '(count not implemented)'
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Vault structure:\n${JSON.stringify(structure, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Obsidian MCP Server running on stdio');
  }
}

// NoteTemplateEngine implementation
class NoteTemplateEngine {
  async generateFromTemplate(templateType, data) {
    const timestamp = new Date().toISOString();
    
    switch (templateType) {
      case 'project-overview':
        return this.generateProjectOverview(data, timestamp);
      case 'decision-gate':
        return this.generateDecisionGate(data, timestamp);
      case 'decision-record':
        return this.generateDecisionRecord(data, timestamp);
      default:
        return `# ${templateType}\n\nGenerated: ${timestamp}\n\n${JSON.stringify(data, null, 2)}`;
    }
  }

  generateProjectOverview(data, timestamp) {
    return `# ${data.projectName} - Project Overview

---
project_id: ${data.projectId}
client_name: ${data.clientName}
project_name: ${data.projectName}
project_type: ${data.projectType || 'Unknown'}
start_date: ${data.startDate || timestamp}
current_status: ${data.currentStatus || 'Planning'}
maturity_level: ${data.maturityLevel || 'POC'}
last_updated: ${timestamp}
---

## Project Summary

**Client:** [[${data.clientName}]]
**Project Type:** ${data.projectType || 'Unknown'}
**Current Maturity Level:** ${data.maturityLevel || 'POC'}
**Status:** ${data.currentStatus || 'Planning'}

### Overview
${data.description || 'Project description to be added.'}

### Objectives
${(data.objectives || []).map(obj => `- ${obj}`).join('\n') || '- To be defined'}

## Architecture Overview

${data.architecture || 'Architecture to be defined.'}

## Business Context

### Stakeholders
${(data.stakeholders || []).map(s => `- **${s.role || 'Role'}:** ${s.name || 'Name'} (${s.contact || 'Contact'})`).join('\n') || '- To be defined'}

## Next Steps

${(data.nextSteps || []).map(step => `1. ${step}`).join('\n') || '1. Define project scope and requirements'}

---

*Last Updated: ${timestamp}*
*Generated by Consulting Delivery System*`;
  }

  generateDecisionGate(data, timestamp) {
    return `# Decision Gate: ${data.targetLevel} Transition

---
gate_id: ${data.id}
project_id: ${data.projectId}
target_level: ${data.targetLevel}
status: ${data.status || 'PENDING'}
created_date: ${data.created || timestamp}
---

## Decision Gate Summary

**Project:** [[${data.projectId}]]
**Transition:** → **${data.targetLevel}**
**Status:** ${data.status || 'PENDING'}
**Created:** ${data.created || timestamp}

## Requirements Validation

${JSON.stringify(data.validation || {}, null, 2)}

## Payment Gate Information

${JSON.stringify(data.paymentGate || {}, null, 2)}

## Decision Record

**Status:** [PENDING/APPROVED/REJECTED]
**Date:** 
**Approver:** 
**Rationale:**

---

*Decision Gate created: ${timestamp}*
*Project: [[${data.projectId}]]*`;
  }

  generateDecisionRecord(data, timestamp) {
    return `# Decision Record

---
decision_id: ${data.id || Date.now()}
project_id: ${data.projectId}
decision_type: ${data.type || 'Unknown'}
status: ${data.status || 'Recorded'}
created_date: ${timestamp}
---

## Decision Details

**Project:** [[${data.projectId}]]
**Decision:** ${data.decision || 'Decision details'}
**Rationale:** ${data.rationale || 'Rationale to be added'}
**Approver:** ${data.approver || 'TBD'}

## Context

${JSON.stringify(data.context || {}, null, 2)}

---

*Decision recorded: ${timestamp}*`;
  }
}

// Start the server
if (require.main === module) {
  const server = new ObsidianMCPServer();
  server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

module.exports = ObsidianMCPServer;