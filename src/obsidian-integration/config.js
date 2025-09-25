/**
 * Obsidian Integration Configuration
 * 
 * Configuration management for the Obsidian integration module
 */

export const defaultConfig = {
  // Vault settings
  vaultPath: process.env.VAULT_PATH || '/Users/speed/Documents/Obsidian Vault',
  vaultName: process.env.VAULT_NAME || 'Obsidian Vault',
  
  // Sync settings
  syncEnabled: true,
  autoLinkEnabled: true,
  bidirectionalSync: true,
  syncInterval: 60000, // 1 minute in milliseconds
  
  // Folder structure
  folders: {
    clients: 'Clients',
    projects: 'Projects',
    meetings: 'Meetings',
    insights: 'Insights',
    templates: 'Templates',
    knowledgeBase: 'Knowledge Base',
    archive: 'Archive'
  },
  
  // Template mappings
  templateMapping: {
    client: 'Client Profile Template',
    project: 'Project Template',
    meeting: 'Meeting Notes Template',
    insight: 'Insight Template',
    weekly_report: 'Weekly Report Template',
    monthly_report: 'Monthly Report Template'
  },
  
  // Tag conventions
  tagConventions: {
    system: 'consulting-system',
    client: 'client',
    project: 'project',
    meeting: 'meeting',
    insight: 'insight',
    active: 'active',
    completed: 'completed',
    archived: 'archived'
  },
  
  // Auto-linking rules
  autoLinkRules: {
    clientToProject: true,
    projectToMeeting: true,
    meetingToActionItems: true,
    insightToProjects: true,
    crossReference: true
  },
  
  // Frontmatter schema
  frontmatterSchema: {
    client: {
      required: ['client_id', 'company', 'contact_person'],
      optional: ['email', 'phone', 'industry', 'status', 'tags']
    },
    project: {
      required: ['project_id', 'client_id', 'project_name'],
      optional: ['start_date', 'end_date', 'status', 'budget', 'tags']
    },
    meeting: {
      required: ['meeting_id', 'client_id', 'meeting_date'],
      optional: ['project_id', 'attendees', 'meeting_type', 'tags']
    },
    insight: {
      required: ['insight_id', 'category'],
      optional: ['confidence', 'source', 'related_project', 'related_client', 'tags']
    }
  },
  
  // Notification settings
  notifications: {
    enabled: true,
    onNoteCreated: true,
    onNoteUpdated: true,
    onSyncCompleted: true,
    onError: true
  },
  
  // Performance settings
  performance: {
    batchSize: 10,
    maxConcurrentOperations: 5,
    retryAttempts: 3,
    retryDelay: 1000
  }
};

export class ObsidianConfig {
  constructor(userConfig = {}) {
    this.config = this.mergeConfig(defaultConfig, userConfig);
    this.validateConfig();
  }
  
  /**
   * Merge user config with default config
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(userConfig)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = { ...defaultConfig[key], ...value };
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }
  
  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.config.vaultPath) {
      throw new Error('vaultPath is required');
    }
    
    if (!this.config.vaultName) {
      throw new Error('vaultName is required');
    }
    
    // Validate folder structure
    for (const [key, value] of Object.entries(this.config.folders)) {
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Invalid folder configuration for ${key}: ${value}`);
      }
    }
    
    // Validate performance settings
    if (this.config.performance.batchSize < 1) {
      throw new Error('batchSize must be greater than 0');
    }
    
    if (this.config.performance.maxConcurrentOperations < 1) {
      throw new Error('maxConcurrentOperations must be greater than 0');
    }
  }
  
  /**
   * Get configuration value by path
   */
  get(path) {
    return this.getNestedValue(this.config, path);
  }
  
  /**
   * Set configuration value by path
   */
  set(path, value) {
    this.setNestedValue(this.config, path, value);
    this.validateConfig();
  }
  
  /**
   * Get folder path for a given type
   */
  getFolder(type) {
    return this.config.folders[type] || type;
  }
  
  /**
   * Get template name for a given type
   */
  getTemplate(type) {
    return this.config.templateMapping[type] || null;
  }
  
  /**
   * Get tag for a given type
   */
  getTag(type) {
    return this.config.tagConventions[type] || type;
  }
  
  /**
   * Check if auto-linking is enabled for a rule
   */
  isAutoLinkEnabled(rule) {
    return this.config.autoLinkRules[rule] === true;
  }
  
  /**
   * Get frontmatter schema for a type
   */
  getFrontmatterSchema(type) {
    return this.config.frontmatterSchema[type] || { required: [], optional: [] };
  }
  
  /**
   * Export configuration as JSON
   */
  toJSON() {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * Load configuration from JSON
   */
  fromJSON(json) {
    const config = JSON.parse(json);
    this.config = this.mergeConfig(defaultConfig, config);
    this.validateConfig();
  }
  
  /**
   * Helper method to get nested object value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Helper method to set nested object value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

export default ObsidianConfig;