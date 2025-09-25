/**
 * VaultManager - Manages Obsidian vault operations for consulting system
 * Handles note creation, updates, linking, and knowledge graph operations
 */

const fs = require('fs').promises;
const path = require('path');

class VaultManager {
  constructor(vaultPath, templateEngine) {
    this.vaultPath = vaultPath;
    this.templateEngine = templateEngine;
    
    // Define vault structure
    this.vaultStructure = {
      projects: 'Projects',
      methodologies: 'Methodologies',
      patterns: 'Patterns',
      templates: 'Templates',
      decisionHistory: 'Decision History',
      artifacts: 'Artifacts'
    };

    // Initialize vault structure if it doesn't exist
    this._ensureVaultStructure();
  }

  /**
   * Create a new project note from template
   * @param {Object} projectData - Project information
   * @param {string} templateType - Template type to use
   * @returns {Promise<string>} Path to created note
   */
  async createProjectNote(projectData, templateType = 'project-overview') {
    try {
      const projectPath = this._getProjectPath(projectData.clientName, projectData.projectName);
      await this._ensureDirectoryExists(path.dirname(projectPath));

      // Generate note content from template
      const noteContent = await this.templateEngine.generateFromTemplate(
        templateType,
        projectData
      );

      // Create the note file
      await fs.writeFile(projectPath, noteContent, 'utf8');

      // Create related notes structure
      await this._createProjectStructure(projectData);

      console.log(`Created project note: ${projectPath}`);
      return projectPath;
    } catch (error) {
      console.error('Error creating project note:', error);
      throw new Error(`Failed to create project note: ${error.message}`);
    }
  }

  /**
   * Update an existing project note
   * @param {string} projectId - Project identifier
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateProjectNote(projectId, updates) {
    try {
      const projectNotePath = await this._findProjectNotePath(projectId);
      if (!projectNotePath) {
        throw new Error(`Project note not found for ID: ${projectId}`);
      }

      // Read existing content
      const existingContent = await fs.readFile(projectNotePath, 'utf8');
      
      // Parse and update frontmatter and content
      const updatedContent = await this._updateNoteContent(existingContent, updates);
      
      // Write updated content
      await fs.writeFile(projectNotePath, updatedContent, 'utf8');

      // Update related notes if needed
      await this._updateRelatedNotes(projectId, updates);

      console.log(`Updated project note: ${projectNotePath}`);
    } catch (error) {
      console.error('Error updating project note:', error);
      throw new Error(`Failed to update project note: ${error.message}`);
    }
  }

  /**
   * Create links between notes
   * @param {string} sourceNote - Source note path
   * @param {string} targetNote - Target note path  
   * @param {string} linkType - Type of link relationship
   * @returns {Promise<void>}
   */
  async linkNotes(sourceNote, targetNote, linkType = 'related') {
    try {
      // Read source note
      const sourceContent = await fs.readFile(sourceNote, 'utf8');
      
      // Generate link markdown
      const targetNoteName = path.basename(targetNote, '.md');
      const link = `[[${targetNoteName}]]`;
      
      // Add link to appropriate section based on type
      const updatedContent = await this._addLinkToNote(sourceContent, link, linkType);
      
      // Write updated source note
      await fs.writeFile(sourceNote, updatedContent, 'utf8');

      // Create backlink in target note if it exists
      if (await this._fileExists(targetNote)) {
        const targetContent = await fs.readFile(targetNote, 'utf8');
        const sourceNoteName = path.basename(sourceNote, '.md');
        const backlink = `[[${sourceNoteName}]]`;
        const updatedTargetContent = await this._addBacklink(targetContent, backlink);
        await fs.writeFile(targetNote, updatedTargetContent, 'utf8');
      }

      console.log(`Linked notes: ${sourceNote} -> ${targetNote} (${linkType})`);
    } catch (error) {
      console.error('Error linking notes:', error);
      throw new Error(`Failed to link notes: ${error.message}`);
    }
  }

  /**
   * Query the knowledge graph
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async queryKnowledgeGraph(query) {
    try {
      const results = [];
      
      // Search through vault based on query type
      switch (query.type) {
        case 'related_projects':
          return await this._findRelatedProjects(query);
        case 'patterns':
          return await this._findPatterns(query);
        case 'decisions':
          return await this._findDecisionHistory(query);
        case 'full_text':
          return await this._fullTextSearch(query);
        default:
          throw new Error(`Unknown query type: ${query.type}`);
      }
    } catch (error) {
      console.error('Error querying knowledge graph:', error);
      throw new Error(`Failed to query knowledge graph: ${error.message}`);
    }
  }

  /**
   * Create a decision gate note
   * @param {Object} decisionGate - Decision gate data
   * @returns {Promise<string>} Path to created note
   */
  async createDecisionGateNote(decisionGate) {
    try {
      const gatePath = path.join(
        this.vaultPath,
        this.vaultStructure.decisionHistory,
        `${decisionGate.id}.md`
      );

      const noteContent = await this.templateEngine.generateFromTemplate(
        'decision-gate',
        decisionGate
      );

      await this._ensureDirectoryExists(path.dirname(gatePath));
      await fs.writeFile(gatePath, noteContent, 'utf8');

      // Link to project note
      const projectNotePath = await this._findProjectNotePath(decisionGate.projectId);
      if (projectNotePath) {
        await this.linkNotes(projectNotePath, gatePath, 'decision-gate');
      }

      console.log(`Created decision gate note: ${gatePath}`);
      return gatePath;
    } catch (error) {
      console.error('Error creating decision gate note:', error);
      throw new Error(`Failed to create decision gate note: ${error.message}`);
    }
  }

  /**
   * Get project maturity history
   * @param {string} projectId - Project identifier
   * @returns {Promise<Array>} Maturity progression history
   */
  async getProjectMaturityHistory(projectId) {
    try {
      const projectNotePath = await this._findProjectNotePath(projectId);
      if (!projectNotePath) {
        return [];
      }

      const content = await fs.readFile(projectNotePath, 'utf8');
      const maturityHistory = this._extractMaturityHistory(content);
      
      return maturityHistory;
    } catch (error) {
      console.error('Error getting maturity history:', error);
      throw new Error(`Failed to get maturity history: ${error.message}`);
    }
  }

  // Private helper methods

  async _ensureVaultStructure() {
    for (const [key, folder] of Object.entries(this.vaultStructure)) {
      const folderPath = path.join(this.vaultPath, folder);
      await this._ensureDirectoryExists(folderPath);
    }
  }

  async _ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  _getProjectPath(clientName, projectName) {
    const sanitizedClient = this._sanitizeFileName(clientName);
    const sanitizedProject = this._sanitizeFileName(projectName);
    
    return path.join(
      this.vaultPath,
      this.vaultStructure.projects,
      sanitizedClient,
      `${sanitizedProject}.md`
    );
  }

  async _createProjectStructure(projectData) {
    const clientPath = path.join(
      this.vaultPath,
      this.vaultStructure.projects,
      this._sanitizeFileName(projectData.clientName)
    );
    
    const projectFolder = path.join(
      clientPath,
      this._sanitizeFileName(projectData.projectName)
    );

    // Create project subfolder structure
    const subfolders = [
      'artifacts',
      'decision-history',
      'hardening-specs',
      'meeting-notes'
    ];

    for (const subfolder of subfolders) {
      await this._ensureDirectoryExists(path.join(projectFolder, subfolder));
    }
  }

  async _findProjectNotePath(projectId) {
    // This would implement a search for project note by ID
    // For now, return a mock path
    const projectsPath = path.join(this.vaultPath, this.vaultStructure.projects);
    
    try {
      // Recursively search for project note with matching ID
      const files = await this._findFilesRecursively(projectsPath, '.md');
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        if (content.includes(`project_id: ${projectId}`)) {
          return file;
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding project note:', error);
      return null;
    }
  }

  async _findFilesRecursively(dirPath, extension) {
    const files = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        const subFiles = await this._findFilesRecursively(itemPath, extension);
        files.push(...subFiles);
      } else if (item.name.endsWith(extension)) {
        files.push(itemPath);
      }
    }
    
    return files;
  }

  async _updateNoteContent(existingContent, updates) {
    // Parse frontmatter and content
    const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---\n/);
    let frontmatter = {};
    let content = existingContent;
    
    if (frontmatterMatch) {
      try {
        frontmatter = this._parseFrontmatter(frontmatterMatch[1]);
        content = existingContent.substring(frontmatterMatch[0].length);
      } catch (error) {
        console.warn('Error parsing frontmatter:', error);
      }
    }

    // Apply updates to frontmatter
    Object.assign(frontmatter, updates);

    // Add timestamp
    frontmatter.last_updated = new Date().toISOString();

    // Rebuild note with updated frontmatter
    const updatedFrontmatter = this._stringifyFrontmatter(frontmatter);
    return `---\n${updatedFrontmatter}\n---\n${content}`;
  }

  _parseFrontmatter(frontmatterText) {
    // Simple YAML parsing - in production, use a proper YAML parser
    const lines = frontmatterText.split('\n');
    const result = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    }
    
    return result;
  }

  _stringifyFrontmatter(frontmatter) {
    return Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  async _addLinkToNote(content, link, linkType) {
    // Add link to appropriate section based on type
    const linkSection = `\n## ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} Links\n\n- ${link}\n`;
    
    // Check if section exists
    const sectionRegex = new RegExp(`## ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} Links`, 'i');
    
    if (content.match(sectionRegex)) {
      // Add to existing section
      return content.replace(sectionRegex, (match) => `${match}\n- ${link}`);
    } else {
      // Create new section at end
      return content + linkSection;
    }
  }

  async _addBacklink(content, backlink) {
    const backlinkSection = '\n## Backlinks\n\n';
    const backlinkRegex = /## Backlinks/i;
    
    if (content.match(backlinkRegex)) {
      return content.replace(backlinkRegex, (match) => `${match}\n- ${backlink}`);
    } else {
      return content + backlinkSection + `- ${backlink}\n`;
    }
  }

  async _updateRelatedNotes(projectId, updates) {
    // Update maturity progression note, decision history, etc.
    if (updates.latestAssessment || updates.latestValidation) {
      await this._updateMaturityProgressionNote(projectId, updates);
    }
    
    if (updates.decisionHistory) {
      await this._updateDecisionHistoryNote(projectId, updates.decisionHistory);
    }
  }

  async _updateMaturityProgressionNote(projectId, updates) {
    const projectNotePath = await this._findProjectNotePath(projectId);
    if (!projectNotePath) return;

    const progressionNotePath = path.join(
      path.dirname(projectNotePath),
      this._sanitizeFileName(projectId),
      'maturity-progression.md'
    );

    let content = '';
    if (await this._fileExists(progressionNotePath)) {
      content = await fs.readFile(progressionNotePath, 'utf8');
    }

    // Add new assessment/validation entry
    const entry = `## ${new Date().toISOString()}\n\n${JSON.stringify(updates, null, 2)}\n\n`;
    content += entry;

    await this._ensureDirectoryExists(path.dirname(progressionNotePath));
    await fs.writeFile(progressionNotePath, content, 'utf8');
  }

  async _updateDecisionHistoryNote(projectId, decision) {
    const projectNotePath = await this._findProjectNotePath(projectId);
    if (!projectNotePath) return;

    const historyNotePath = path.join(
      path.dirname(projectNotePath),
      this._sanitizeFileName(projectId),
      'decision-history',
      `decision-${Date.now()}.md`
    );

    const content = await this.templateEngine.generateFromTemplate('decision-record', decision);
    
    await this._ensureDirectoryExists(path.dirname(historyNotePath));
    await fs.writeFile(historyNotePath, content, 'utf8');
  }

  _extractMaturityHistory(content) {
    // Extract maturity progression from note content
    // This would parse the note and extract historical maturity data
    return [];
  }

  async _findRelatedProjects(query) {
    // Implementation for finding related projects
    return [];
  }

  async _findPatterns(query) {
    // Implementation for finding patterns
    return [];
  }

  async _findDecisionHistory(query) {
    // Implementation for finding decision history
    return [];
  }

  async _fullTextSearch(query) {
    // Implementation for full-text search
    return [];
  }

  _sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_');
  }
}

module.exports = VaultManager;