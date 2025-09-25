/**
 * Obsidian Integration Module
 * 
 * This module provides a high-level interface for interacting with the Obsidian MCP server,
 * enabling seamless bidirectional sync between the consulting system and Obsidian vault.
 */

import EventEmitter from 'events';
import path from 'path';

export class ObsidianIntegration extends EventEmitter {
  constructor(mcpClient, options = {}) {
    super();
    this.mcpClient = mcpClient;
    this.vaultPath = options.vaultPath || process.env.VAULT_PATH;
    this.vaultName = options.vaultName || process.env.VAULT_NAME || 'Obsidian Vault';
    this.syncEnabled = options.syncEnabled !== false;
    this.autoLinkEnabled = options.autoLinkEnabled !== false;
    this.templateMapping = options.templateMapping || {};
    
    // Initialize sync state
    this.lastSyncTime = new Date();
    this.pendingChanges = new Map();
    this.syncInProgress = false;
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Listen for consulting system events that should sync to Obsidian
    this.on('client_created', (client) => this.syncClientToNote(client));
    this.on('project_created', (project) => this.syncProjectToNote(project));
    this.on('meeting_completed', (meeting) => this.syncMeetingToNote(meeting));
    this.on('insight_generated', (insight) => this.syncInsightToNote(insight));
  }

  /**
   * Initialize the integration and perform initial sync
   */
  async initialize() {
    try {
      // Test MCP connection
      await this.testConnection();
      
      // Perform initial sync if enabled
      if (this.syncEnabled) {
        await this.performInitialSync();
      }
      
      this.emit('initialized');
      return { success: true, message: 'Obsidian integration initialized successfully' };
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to initialize Obsidian integration: ${error.message}`);
    }
  }

  /**
   * Test the MCP connection
   */
  async testConnection() {
    const result = await this.mcpClient.callTool('obsidian-mcp', 'list_notes', { 
      limit: 1 
    });
    
    if (!result || result.error) {
      throw new Error('Failed to connect to Obsidian MCP server');
    }
    
    return true;
  }

  /**
   * Create a new note in the vault
   */
  async createNote(noteData) {
    const { title, content, folder, tags, frontmatter } = noteData;
    
    try {
      const result = await this.mcpClient.callTool('obsidian-mcp', 'create_note', {
        title,
        content,
        folder,
        tags,
        frontmatter: {
          ...frontmatter,
          created_by: 'consulting_system',
          sync_id: this.generateSyncId()
        }
      });
      
      this.emit('note_created', { title, path: folder ? `${folder}/${title}.md` : `${title}.md` });
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(notePath, content, options = {}) {
    try {
      const result = await this.mcpClient.callTool('obsidian-mcp', 'update_note', {
        notePath,
        content,
        appendMode: options.appendMode || false,
        frontmatter: {
          ...options.frontmatter,
          modified_by: 'consulting_system',
          last_sync: new Date().toISOString()
        }
      });
      
      this.emit('note_updated', { path: notePath });
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Search for notes in the vault
   */
  async searchNotes(query, options = {}) {
    try {
      return await this.mcpClient.callTool('obsidian-mcp', 'search_vault', {
        query,
        searchType: options.searchType || 'both',
        limit: options.limit || 10,
        folder: options.folder
      });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get the vault graph structure
   */
  async getVaultGraph(options = {}) {
    try {
      return await this.mcpClient.callTool('obsidian-mcp', 'get_graph', {
        maxDepth: options.maxDepth || 2,
        includeOrphans: options.includeOrphans || false,
        folder: options.folder
      });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create links between notes
   */
  async createLink(sourceNote, targetNote, linkText, position = 'end') {
    try {
      const result = await this.mcpClient.callTool('obsidian-mcp', 'create_link', {
        sourceNote,
        targetNote,
        linkText,
        position
      });
      
      this.emit('link_created', { source: sourceNote, target: targetNote });
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Apply a template to create a new note
   */
  async applyTemplate(templateName, noteTitle, variables = {}, folder) {
    try {
      return await this.mcpClient.callTool('obsidian-mcp', 'apply_template', {
        templateName,
        noteTitle,
        variables,
        folder
      });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync client data to Obsidian note
   */
  async syncClientToNote(client) {
    const folder = 'Clients';
    const noteTitle = `${client.company || client.name} - Client Profile`;
    
    const content = this.formatClientNote(client);
    const tags = ['client', 'consulting', ...(client.industry ? [client.industry.toLowerCase()] : [])];
    
    const frontmatter = {
      client_id: client.id,
      company: client.company,
      contact_person: client.name,
      email: client.email,
      phone: client.phone,
      industry: client.industry,
      status: client.status || 'active'
    };
    
    return await this.createNote({
      title: noteTitle,
      content,
      folder,
      tags,
      frontmatter
    });
  }

  /**
   * Sync project data to Obsidian note
   */
  async syncProjectToNote(project) {
    const folder = `Projects/${project.clientName || 'General'}`;
    const noteTitle = `${project.name} - Project`;
    
    const content = this.formatProjectNote(project);
    const tags = ['project', 'consulting', ...(project.type ? [project.type.toLowerCase()] : [])];
    
    const frontmatter = {
      project_id: project.id,
      client_id: project.clientId,
      project_name: project.name,
      start_date: project.startDate,
      end_date: project.endDate,
      status: project.status || 'active',
      budget: project.budget
    };
    
    return await this.createNote({
      title: noteTitle,
      content,
      folder,
      tags,
      frontmatter
    });
  }

  /**
   * Sync meeting notes to Obsidian
   */
  async syncMeetingToNote(meeting) {
    const folder = `Meetings/${meeting.clientName || 'General'}`;
    const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
    const noteTitle = `${meetingDate} - ${meeting.title || 'Meeting'}`;
    
    const content = this.formatMeetingNote(meeting);
    const tags = ['meeting', 'consulting', ...(meeting.type ? [meeting.type.toLowerCase()] : [])];
    
    const frontmatter = {
      meeting_id: meeting.id,
      client_id: meeting.clientId,
      project_id: meeting.projectId,
      meeting_date: meeting.date,
      attendees: meeting.attendees,
      meeting_type: meeting.type
    };
    
    return await this.createNote({
      title: noteTitle,
      content,
      folder,
      tags,
      frontmatter
    });
  }

  /**
   * Sync insights to Obsidian
   */
  async syncInsightToNote(insight) {
    const folder = 'Insights';
    const noteTitle = `${insight.title} - Insight`;
    
    const content = this.formatInsightNote(insight);
    const tags = ['insight', 'consulting', ...(insight.category ? [insight.category.toLowerCase()] : [])];
    
    const frontmatter = {
      insight_id: insight.id,
      category: insight.category,
      confidence: insight.confidence,
      source: insight.source,
      related_project: insight.projectId,
      related_client: insight.clientId
    };
    
    return await this.createNote({
      title: noteTitle,
      content,
      folder,
      tags,
      frontmatter
    });
  }

  /**
   * Perform initial sync of existing data
   */
  async performInitialSync() {
    // This would typically sync existing data from the consulting system to Obsidian
    // Implementation depends on the specific consulting system data structure
    console.log('Performing initial sync...');
    
    // Create folder structure
    const folders = [
      'Clients',
      'Projects',
      'Meetings',
      'Insights',
      'Templates',
      'Knowledge Base'
    ];
    
    for (const folder of folders) {
      await this.createNote({
        title: 'README',
        content: `# ${folder}\n\nThis folder contains ${folder.toLowerCase()} managed by the consulting system.`,
        folder,
        tags: ['system', 'readme'],
        frontmatter: {
          folder_type: folder.toLowerCase(),
          auto_generated: true
        }
      }).catch(() => {}); // Ignore if already exists
    }
  }

  /**
   * Enable auto-linking between related notes
   */
  async enableAutoLinking() {
    this.autoLinkEnabled = true;
    // Implementation would analyze note content and create relevant links
  }

  /**
   * Disable auto-linking
   */
  disableAutoLinking() {
    this.autoLinkEnabled = false;
  }

  /**
   * Format client data for Obsidian note
   */
  formatClientNote(client) {
    return `# ${client.company || client.name}

## Contact Information
- **Name**: ${client.name}
- **Email**: ${client.email || 'Not provided'}
- **Phone**: ${client.phone || 'Not provided'}
- **Company**: ${client.company || 'Individual'}

## Details
- **Industry**: ${client.industry || 'Not specified'}
- **Status**: ${client.status || 'Active'}
- **Added**: ${new Date().toISOString().split('T')[0]}

## Projects
<!-- Projects will be linked here automatically -->

## Meeting History
<!-- Meeting notes will be linked here automatically -->

## Notes
${client.notes || 'No additional notes.'}
`;
  }

  /**
   * Format project data for Obsidian note
   */
  formatProjectNote(project) {
    return `# ${project.name}

## Project Overview
- **Client**: [[${project.clientName}]]
- **Start Date**: ${project.startDate || 'TBD'}
- **End Date**: ${project.endDate || 'TBD'}
- **Status**: ${project.status || 'Active'}
- **Budget**: ${project.budget || 'Not specified'}

## Description
${project.description || 'No description provided.'}

## Objectives
${project.objectives ? project.objectives.map(obj => `- ${obj}`).join('\n') : '- No objectives defined'}

## Deliverables
${project.deliverables ? project.deliverables.map(del => `- [ ] ${del}`).join('\n') : '- No deliverables defined'}

## Timeline
${project.timeline || 'No timeline defined.'}

## Resources
${project.resources ? project.resources.map(res => `- ${res}`).join('\n') : '- No resources specified'}

## Risks
${project.risks ? project.risks.map(risk => `- ${risk}`).join('\n') : '- No risks identified'}

## Meeting Notes
<!-- Meeting notes will be linked here automatically -->

## Progress Notes
<!-- Progress updates will be added here -->
`;
  }

  /**
   * Format meeting data for Obsidian note
   */
  formatMeetingNote(meeting) {
    return `# ${meeting.title || 'Meeting'}

## Meeting Details
- **Date**: ${new Date(meeting.date).toDateString()}
- **Time**: ${meeting.time || 'Not specified'}
- **Duration**: ${meeting.duration || 'Not specified'}
- **Type**: ${meeting.type || 'General'}
- **Client**: [[${meeting.clientName}]]
${meeting.projectName ? `- **Project**: [[${meeting.projectName}]]` : ''}

## Attendees
${meeting.attendees ? meeting.attendees.map(attendee => `- ${attendee}`).join('\n') : '- Not specified'}

## Agenda
${meeting.agenda ? meeting.agenda.map(item => `- ${item}`).join('\n') : '- No agenda provided'}

## Discussion Points
${meeting.notes || 'No notes recorded.'}

## Action Items
${meeting.actionItems ? meeting.actionItems.map(item => `- [ ] ${item.task} (${item.assignee || 'Unassigned'})`).join('\n') : '- No action items recorded'}

## Next Steps
${meeting.nextSteps || 'No next steps defined.'}

## Follow-up
- **Next Meeting**: ${meeting.nextMeeting || 'TBD'}
- **Follow-up Required**: ${meeting.followUpRequired ? 'Yes' : 'No'}
`;
  }

  /**
   * Format insight data for Obsidian note
   */
  formatInsightNote(insight) {
    return `# ${insight.title}

## Insight Details
- **Category**: ${insight.category || 'General'}
- **Confidence**: ${insight.confidence || 'Not rated'}/10
- **Source**: ${insight.source || 'Unknown'}
- **Generated**: ${new Date().toISOString().split('T')[0]}

## Description
${insight.description || 'No description provided.'}

## Key Findings
${insight.findings ? insight.findings.map(finding => `- ${finding}`).join('\n') : '- No findings recorded'}

## Recommendations
${insight.recommendations ? insight.recommendations.map(rec => `- ${rec}`).join('\n') : '- No recommendations provided'}

## Supporting Data
${insight.data ? '```json\n' + JSON.stringify(insight.data, null, 2) + '\n```' : 'No supporting data available.'}

## Related
${insight.relatedProjects ? insight.relatedProjects.map(project => `- Project: [[${project}]]`).join('\n') : ''}
${insight.relatedClients ? insight.relatedClients.map(client => `- Client: [[${client}]]`).join('\n') : ''}

## Next Actions
${insight.nextActions ? insight.nextActions.map(action => `- [ ] ${action}`).join('\n') : '- No next actions defined'}
`;
  }

  /**
   * Generate a unique sync ID
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      initialized: this.mcpClient !== null,
      syncEnabled: this.syncEnabled,
      autoLinkEnabled: this.autoLinkEnabled,
      vaultPath: this.vaultPath,
      vaultName: this.vaultName,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.pendingChanges.size,
      syncInProgress: this.syncInProgress
    };
  }
}

export default ObsidianIntegration;