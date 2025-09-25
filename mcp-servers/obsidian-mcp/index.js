#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import MarkdownIt from "markdown-it";
import fm from "front-matter";
import Fuse from "fuse.js";

const md = new MarkdownIt();

class ObsidianMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "obsidian-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.vaultPath = process.env.VAULT_PATH || process.cwd();
    this.vaultName = process.env.VAULT_NAME || "Obsidian Vault";
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_note",
            description: "Create a new note in the Obsidian vault",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The title of the note"
                },
                content: {
                  type: "string",
                  description: "The content of the note in markdown format"
                },
                folder: {
                  type: "string",
                  description: "Optional folder path (relative to vault root)"
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Optional array of tags"
                },
                frontmatter: {
                  type: "object",
                  description: "Optional frontmatter metadata"
                }
              },
              required: ["title", "content"]
            }
          },
          {
            name: "update_note",
            description: "Update an existing note in the Obsidian vault",
            inputSchema: {
              type: "object",
              properties: {
                notePath: {
                  type: "string",
                  description: "Path to the note (relative to vault root)"
                },
                content: {
                  type: "string",
                  description: "New content for the note"
                },
                appendMode: {
                  type: "boolean",
                  description: "Whether to append to existing content (default: false)",
                  default: false
                },
                frontmatter: {
                  type: "object",
                  description: "Optional frontmatter metadata to update"
                }
              },
              required: ["notePath", "content"]
            }
          },
          {
            name: "search_vault",
            description: "Search for notes in the vault by content or title",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query"
                },
                searchType: {
                  type: "string",
                  enum: ["title", "content", "both", "tags"],
                  description: "Type of search to perform",
                  default: "both"
                },
                limit: {
                  type: "integer",
                  description: "Maximum number of results to return",
                  default: 10
                },
                folder: {
                  type: "string",
                  description: "Optional folder to search within"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "create_link",
            description: "Create a link between two notes",
            inputSchema: {
              type: "object",
              properties: {
                sourceNote: {
                  type: "string",
                  description: "Path to the source note"
                },
                targetNote: {
                  type: "string",
                  description: "Path to the target note"
                },
                linkText: {
                  type: "string",
                  description: "Optional display text for the link"
                },
                position: {
                  type: "string",
                  enum: ["end", "beginning"],
                  description: "Where to insert the link",
                  default: "end"
                }
              },
              required: ["sourceNote", "targetNote"]
            }
          },
          {
            name: "get_graph",
            description: "Get the graph structure of notes and their connections",
            inputSchema: {
              type: "object",
              properties: {
                maxDepth: {
                  type: "integer",
                  description: "Maximum depth of connections to traverse",
                  default: 2
                },
                includeOrphans: {
                  type: "boolean",
                  description: "Include notes with no connections",
                  default: false
                },
                folder: {
                  type: "string",
                  description: "Optional folder to analyze"
                }
              }
            }
          },
          {
            name: "apply_template",
            description: "Apply a template to create a new note",
            inputSchema: {
              type: "object",
              properties: {
                templateName: {
                  type: "string",
                  description: "Name of the template to use"
                },
                noteTitle: {
                  type: "string",
                  description: "Title for the new note"
                },
                variables: {
                  type: "object",
                  description: "Variables to replace in the template"
                },
                folder: {
                  type: "string",
                  description: "Optional folder for the new note"
                }
              },
              required: ["templateName", "noteTitle"]
            }
          },
          {
            name: "list_notes",
            description: "List all notes in the vault with optional filtering",
            inputSchema: {
              type: "object",
              properties: {
                folder: {
                  type: "string",
                  description: "Optional folder to list notes from"
                },
                includeSubfolders: {
                  type: "boolean",
                  description: "Include notes from subfolders",
                  default: true
                },
                sortBy: {
                  type: "string",
                  enum: ["title", "created", "modified", "size"],
                  description: "Sort criteria",
                  default: "title"
                },
                limit: {
                  type: "integer",
                  description: "Maximum number of notes to return",
                  default: 100
                }
              }
            }
          },
          {
            name: "get_note",
            description: "Get the content and metadata of a specific note",
            inputSchema: {
              type: "object",
              properties: {
                notePath: {
                  type: "string",
                  description: "Path to the note (relative to vault root)"
                }
              },
              required: ["notePath"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "create_note":
            return await this.createNote(args);
          case "update_note":
            return await this.updateNote(args);
          case "search_vault":
            return await this.searchVault(args);
          case "create_link":
            return await this.createLink(args);
          case "get_graph":
            return await this.getGraph(args);
          case "apply_template":
            return await this.applyTemplate(args);
          case "list_notes":
            return await this.listNotes(args);
          case "get_note":
            return await this.getNote(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async createNote(args) {
    const { title, content, folder, tags, frontmatter } = args;
    
    // Create the note path
    let notePath = `${title}.md`;
    if (folder) {
      notePath = path.join(folder, notePath);
      // Ensure folder exists
      await fs.mkdir(path.join(this.vaultPath, folder), { recursive: true });
    }
    
    const fullPath = path.join(this.vaultPath, notePath);
    
    // Build frontmatter
    let fm_data = { ...frontmatter };
    if (tags && tags.length > 0) {
      fm_data.tags = tags;
    }
    fm_data.created = new Date().toISOString();
    fm_data.modified = new Date().toISOString();
    
    // Build content with frontmatter
    let noteContent = content;
    if (Object.keys(fm_data).length > 0) {
      const yamlFrontmatter = Object.entries(fm_data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.map(v => `"${v}"`).join(', ')}]` : `"${value}"`}`)
        .join('\n');
      noteContent = `---\n${yamlFrontmatter}\n---\n\n${content}`;
    }
    
    await fs.writeFile(fullPath, noteContent, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully created note: ${notePath}`
        }
      ]
    };
  }

  async updateNote(args) {
    const { notePath, content, appendMode, frontmatter } = args;
    const fullPath = path.join(this.vaultPath, notePath);
    
    let finalContent = content;
    
    if (appendMode) {
      try {
        const existingContent = await fs.readFile(fullPath, 'utf8');
        finalContent = existingContent + '\n\n' + content;
      } catch (error) {
        // File doesn't exist, just use the new content
      }
    }
    
    // Handle frontmatter updates
    if (frontmatter) {
      const parsed = fm(finalContent);
      const updatedFrontmatter = { ...parsed.attributes, ...frontmatter };
      updatedFrontmatter.modified = new Date().toISOString();
      
      const yamlFrontmatter = Object.entries(updatedFrontmatter)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.map(v => `"${v}"`).join(', ')}]` : `"${value}"`}`)
        .join('\n');
      finalContent = `---\n${yamlFrontmatter}\n---\n\n${parsed.body}`;
    }
    
    await fs.writeFile(fullPath, finalContent, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully updated note: ${notePath}`
        }
      ]
    };
  }

  async searchVault(args) {
    const { query, searchType = "both", limit = 10, folder } = args;
    
    // Get all markdown files
    let searchPattern = "**/*.md";
    if (folder) {
      searchPattern = path.join(folder, "**/*.md");
    }
    
    const files = await glob(searchPattern, { cwd: this.vaultPath });
    const results = [];
    
    for (const file of files) {
      const fullPath = path.join(this.vaultPath, file);
      const content = await fs.readFile(fullPath, 'utf8');
      const parsed = fm(content);
      
      let match = false;
      let matchType = '';
      
      // Search in title
      if (searchType === "title" || searchType === "both") {
        const title = path.basename(file, '.md');
        if (title.toLowerCase().includes(query.toLowerCase())) {
          match = true;
          matchType = 'title';
        }
      }
      
      // Search in content
      if (!match && (searchType === "content" || searchType === "both")) {
        if (parsed.body.toLowerCase().includes(query.toLowerCase())) {
          match = true;
          matchType = 'content';
        }
      }
      
      // Search in tags
      if (!match && searchType === "tags") {
        const tags = parsed.attributes.tags || [];
        if (Array.isArray(tags) && tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
          match = true;
          matchType = 'tags';
        }
      }
      
      if (match) {
        const stats = await fs.stat(fullPath);
        results.push({
          path: file,
          title: path.basename(file, '.md'),
          matchType,
          frontmatter: parsed.attributes,
          excerpt: this.getExcerpt(parsed.body, query),
          modified: stats.mtime,
          created: stats.birthtime
        });
      }
      
      if (results.length >= limit) break;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} notes matching "${query}":\n\n` +
                results.map(r => `**${r.title}** (${r.path})\n- Match type: ${r.matchType}\n- Excerpt: ${r.excerpt}\n- Modified: ${r.modified.toISOString()}\n`).join('\n')
        }
      ]
    };
  }

  async createLink(args) {
    const { sourceNote, targetNote, linkText, position = "end" } = args;
    const sourcePath = path.join(this.vaultPath, sourceNote);
    
    // Read source note
    const content = await fs.readFile(sourcePath, 'utf8');
    const targetTitle = linkText || path.basename(targetNote, '.md');
    const link = `[[${path.basename(targetNote, '.md')}${linkText ? `|${linkText}` : ''}]]`;
    
    let updatedContent;
    if (position === "beginning") {
      updatedContent = link + '\n\n' + content;
    } else {
      updatedContent = content + '\n\n' + link;
    }
    
    await fs.writeFile(sourcePath, updatedContent, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully created link from ${sourceNote} to ${targetNote}`
        }
      ]
    };
  }

  async getGraph(args) {
    const { maxDepth = 2, includeOrphans = false, folder } = args;
    
    let searchPattern = "**/*.md";
    if (folder) {
      searchPattern = path.join(folder, "**/*.md");
    }
    
    const files = await glob(searchPattern, { cwd: this.vaultPath });
    const nodes = new Map();
    const edges = [];
    
    // Build nodes and find links
    for (const file of files) {
      const fullPath = path.join(this.vaultPath, file);
      const content = await fs.readFile(fullPath, 'utf8');
      const parsed = fm(content);
      const title = path.basename(file, '.md');
      
      nodes.set(file, {
        id: file,
        title,
        path: file,
        tags: parsed.attributes.tags || [],
        connections: 0
      });
      
      // Find wikilinks [[note]] or [[note|display text]]
      const linkRegex = /\[\[([^\]|]+)(\|[^\]]+)?\]\]/g;
      let match;
      
      while ((match = linkRegex.exec(parsed.body)) !== null) {
        const targetTitle = match[1];
        const targetFile = files.find(f => path.basename(f, '.md') === targetTitle);
        
        if (targetFile) {
          edges.push({
            source: file,
            target: targetFile,
            type: 'internal_link'
          });
        }
      }
    }
    
    // Count connections
    edges.forEach(edge => {
      if (nodes.has(edge.source)) {
        nodes.get(edge.source).connections++;
      }
      if (nodes.has(edge.target)) {
        nodes.get(edge.target).connections++;
      }
    });
    
    // Filter orphans if needed
    const nodesArray = Array.from(nodes.values());
    const filteredNodes = includeOrphans ? nodesArray : nodesArray.filter(node => node.connections > 0);
    
    return {
      content: [
        {
          type: "text",
          text: `Vault Graph Analysis:\n\n` +
                `Total Notes: ${filteredNodes.length}\n` +
                `Total Connections: ${edges.length}\n\n` +
                `Nodes:\n${filteredNodes.map(node => `- ${node.title} (${node.connections} connections)`).join('\n')}\n\n` +
                `Most Connected Notes:\n${filteredNodes.sort((a, b) => b.connections - a.connections).slice(0, 10).map(node => `- ${node.title}: ${node.connections} connections`).join('\n')}`
        }
      ]
    };
  }

  async applyTemplate(args) {
    const { templateName, noteTitle, variables = {}, folder } = args;
    
    // Look for template in Templates folder
    const templatePath = path.join(this.vaultPath, 'Templates', `${templateName}.md`);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Replace variables
      let processedContent = templateContent;
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(placeholder, value);
      });
      
      // Replace common template variables
      const now = new Date();
      processedContent = processedContent
        .replace(/\{\{title\}\}/g, noteTitle)
        .replace(/\{\{date\}\}/g, now.toISOString().split('T')[0])
        .replace(/\{\{time\}\}/g, now.toTimeString().split(' ')[0])
        .replace(/\{\{datetime\}\}/g, now.toISOString());
      
      // Create the note
      return await this.createNote({
        title: noteTitle,
        content: processedContent,
        folder
      });
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Template "${templateName}" not found in Templates folder`);
      }
      throw error;
    }
  }

  async listNotes(args) {
    const { folder, includeSubfolders = true, sortBy = "title", limit = 100 } = args;
    
    let searchPattern = "**/*.md";
    if (folder) {
      searchPattern = includeSubfolders ? path.join(folder, "**/*.md") : path.join(folder, "*.md");
    }
    
    const files = await glob(searchPattern, { cwd: this.vaultPath });
    const notes = [];
    
    for (const file of files.slice(0, limit)) {
      const fullPath = path.join(this.vaultPath, file);
      const stats = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath, 'utf8');
      const parsed = fm(content);
      
      notes.push({
        path: file,
        title: path.basename(file, '.md'),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        tags: parsed.attributes.tags || [],
        frontmatter: parsed.attributes
      });
    }
    
    // Sort notes
    notes.sort((a, b) => {
      switch (sortBy) {
        case "created":
          return b.created - a.created;
        case "modified":
          return b.modified - a.modified;
        case "size":
          return b.size - a.size;
        default: // title
          return a.title.localeCompare(b.title);
      }
    });
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${notes.length} notes:\n\n` +
                notes.map(note => `**${note.title}**\n- Path: ${note.path}\n- Modified: ${note.modified.toISOString()}\n- Size: ${note.size} bytes\n- Tags: ${note.tags.join(', ') || 'none'}\n`).join('\n')
        }
      ]
    };
  }

  async getNote(args) {
    const { notePath } = args;
    const fullPath = path.join(this.vaultPath, notePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const parsed = fm(content);
      const stats = await fs.stat(fullPath);
      
      return {
        content: [
          {
            type: "text",
            text: `# ${path.basename(notePath, '.md')}\n\n` +
                  `**Path:** ${notePath}\n` +
                  `**Created:** ${stats.birthtime.toISOString()}\n` +
                  `**Modified:** ${stats.mtime.toISOString()}\n` +
                  `**Size:** ${stats.size} bytes\n\n` +
                  `**Frontmatter:**\n\`\`\`yaml\n${JSON.stringify(parsed.attributes, null, 2)}\n\`\`\`\n\n` +
                  `**Content:**\n${parsed.body}`
          }
        ]
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Note not found: ${notePath}`);
      }
      throw error;
    }
  }

  getExcerpt(content, query, maxLength = 200) {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }
    
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, queryIndex + query.length + 100);
    let excerpt = content.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return excerpt;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Obsidian MCP server running on stdio");
  }
}

const server = new ObsidianMCPServer();
server.run().catch(console.error);