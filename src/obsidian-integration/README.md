# Obsidian Integration Module

A comprehensive integration system that provides seamless bidirectional synchronization between consulting systems and Obsidian vaults through the Model Context Protocol (MCP).

## Overview

This integration consists of two main components:

1. **Obsidian MCP Server** (`mcp-servers/obsidian-mcp/`) - A standalone MCP server that provides tools for interacting with Obsidian vaults
2. **Integration Module** (`src/obsidian-integration/`) - A high-level JavaScript module that makes it easy to sync consulting data with Obsidian

## Features

### MCP Server Tools

- **`create_note`** - Create new notes with frontmatter and content
- **`update_note`** - Update existing notes with append or replace modes
- **`search_vault`** - Search notes by title, content, or tags
- **`create_link`** - Create wikilinks between notes
- **`get_graph`** - Analyze vault structure and note connections  
- **`apply_template`** - Apply templates to create new notes
- **`list_notes`** - List notes with filtering and sorting options
- **`get_note`** - Retrieve specific note content and metadata

### Integration Features

- **Automatic Sync** - Sync clients, projects, meetings, and insights to Obsidian
- **Template Support** - Use Obsidian templates for consistent note structure
- **Auto-linking** - Automatically create links between related notes
- **Event-driven** - React to consulting system events in real-time
- **Configurable** - Extensive configuration options for folders, tags, and behavior
- **Bidirectional** - Support for both reading from and writing to Obsidian

## Quick Start

### 1. MCP Server Setup

The MCP server is already configured in your `.mcp.json`:

```json
{
  "mcpServers": {
    "obsidian-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-servers/obsidian-mcp/index.js"],
      "env": {
        "VAULT_PATH": "/Users/speed/Documents/Obsidian Vault",
        "VAULT_NAME": "Obsidian Vault"
      }
    }
  }
}
```

### 2. Using the Integration Module

```javascript
import { ObsidianIntegration } from './src/obsidian-integration/index.js';
import { ObsidianConfig } from './src/obsidian-integration/config.js';

// Initialize with custom configuration
const config = new ObsidianConfig({
  vaultPath: '/path/to/your/vault',
  syncEnabled: true,
  autoLinkEnabled: true
});

// Create integration instance
const integration = new ObsidianIntegration(mcpClient, config.config);

// Initialize and start syncing
await integration.initialize();

// Sync a client
await integration.syncClientToNote({
  id: 'client_001',
  name: 'John Smith',
  company: 'Acme Corp',
  email: 'john@acme.com'
});
```

### 3. Run the Example

```bash
cd src/obsidian-integration
node example.js
```

## Configuration

The integration supports extensive configuration through the `ObsidianConfig` class:

```javascript
const config = new ObsidianConfig({
  // Vault settings
  vaultPath: '/path/to/vault',
  vaultName: 'My Vault',
  
  // Sync settings
  syncEnabled: true,
  autoLinkEnabled: true,
  syncInterval: 60000,
  
  // Folder structure
  folders: {
    clients: 'Clients',
    projects: 'Projects', 
    meetings: 'Meetings',
    insights: 'Insights'
  },
  
  // Template mappings
  templateMapping: {
    client: 'Client Profile Template',
    project: 'Consulting Project Template',
    meeting: 'Meeting Notes Template',
    insight: 'Insight Template'
  },
  
  // Auto-linking rules
  autoLinkRules: {
    clientToProject: true,
    projectToMeeting: true,
    insightToProjects: true
  }
});
```

## Templates

The integration includes comprehensive templates for different note types:

### Client Profile Template
- Contact information and details
- Project history and meeting links
- Account management information

### Consulting Project Template  
- Project overview and objectives
- Timeline and milestones
- Team and resource management
- Progress tracking

### Meeting Notes Template
- Structured meeting documentation
- Action items and decisions
- Follow-up planning

### Insight Template
- Data-driven insights and analysis
- Recommendations and implementation plans
- Success metrics and validation

## API Reference

### ObsidianIntegration Class

#### Constructor
```javascript
new ObsidianIntegration(mcpClient, options)
```

#### Methods

- **`initialize()`** - Initialize the integration
- **`createNote(noteData)`** - Create a new note
- **`updateNote(notePath, content, options)`** - Update an existing note
- **`searchNotes(query, options)`** - Search for notes
- **`getVaultGraph(options)`** - Get vault structure
- **`syncClientToNote(client)`** - Sync client data to note
- **`syncProjectToNote(project)`** - Sync project data to note
- **`syncMeetingToNote(meeting)`** - Sync meeting data to note
- **`syncInsightToNote(insight)`** - Sync insight data to note

#### Events

- **`initialized`** - Integration initialized successfully
- **`note_created`** - Note was created
- **`note_updated`** - Note was updated
- **`error`** - Error occurred

### ObsidianUtils Class

Utility functions for working with Obsidian data:

- **`sanitizeFilename(filename)`** - Clean filename for Obsidian
- **`createWikilink(noteName, displayText)`** - Generate wikilinks
- **`parseWikilinks(content)`** - Extract wikilinks from content
- **`formatDate(date, format)`** - Format dates for Obsidian
- **`parseFrontmatter(content)`** - Parse YAML frontmatter
- **`buildFrontmatter(attributes)`** - Build YAML frontmatter
- **`generateTOC(content)`** - Generate table of contents
- **`generateSummary(content, maxLength)`** - Create note summaries

## Folder Structure

The integration creates and manages the following folder structure:

```
Obsidian Vault/
├── Clients/                    # Client profiles
├── Projects/                   # Project documentation
│   └── [Client Name]/         # Project folders per client
├── Meetings/                   # Meeting notes
│   └── [Client Name]/         # Meeting folders per client
├── Insights/                   # Analysis and insights
├── Templates/                  # Note templates
│   ├── Client Profile Template.md
│   ├── Consulting Project Template.md
│   ├── Meeting Notes Template.md
│   └── Insight Template.md
└── Knowledge Base/            # General knowledge
```

## Sync Behavior

### Client Sync
- Creates client profile notes in `Clients/` folder
- Includes contact information, industry, and status
- Tags: `client`, `consulting`, `[industry]`

### Project Sync
- Creates project notes in `Projects/[Client]/` folder
- Links to client profiles automatically
- Tracks objectives, deliverables, and progress
- Tags: `project`, `consulting`, `[type]`

### Meeting Sync
- Creates meeting notes in `Meetings/[Client]/` folder
- Links to related clients and projects
- Tracks attendees, decisions, and action items
- Tags: `meeting`, `consulting`, `[type]`

### Insight Sync
- Creates insight notes in `Insights/` folder
- Links to related projects and clients
- Includes analysis, recommendations, and metrics
- Tags: `insight`, `consulting`, `[category]`

## Error Handling

The integration includes comprehensive error handling:

```javascript
integration.on('error', (error) => {
  console.error('Integration error:', error.message);
  // Handle error appropriately
});
```

Common error scenarios:
- MCP server connection failures
- File system permission issues  
- Invalid note content or frontmatter
- Template not found errors

## Performance Considerations

- Batch operations when possible
- Configurable sync intervals
- Lazy loading of vault data
- Connection pooling for MCP calls
- Intelligent caching of frequently accessed notes

## Security

- All file system operations are sandboxed to the vault path
- Input sanitization for filenames and content
- Validation of frontmatter schema
- Safe template variable replacement

## Development

### Running Tests

```bash
cd src/obsidian-integration
npm test  # (when tests are implemented)
```

### Debugging

Set the `DEBUG` environment variable:

```bash
DEBUG=obsidian-integration node your-script.js
```

### Contributing

1. Follow the existing code style
2. Add comprehensive error handling
3. Update templates as needed
4. Document new features in this README

## Troubleshooting

### MCP Server Won't Start
- Check that Node.js is installed
- Verify the vault path exists and is accessible
- Check `.mcp.json` configuration

### Notes Not Syncing
- Verify MCP connection is active
- Check folder permissions
- Ensure templates exist in the Templates folder
- Review error logs for specific issues

### Template Variables Not Replacing
- Check template syntax uses `{{variable}}` format
- Verify variable names match data fields
- Ensure template files are valid markdown

### Performance Issues
- Reduce sync frequency if vault is large
- Implement selective syncing for specific data types
- Use batch operations for bulk updates

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Full MCP server implementation  
- Integration module with sync capabilities
- Comprehensive templates
- Configuration system
- Utility functions
- Event-driven architecture