/**
 * Obsidian Integration Utilities
 * 
 * Common utility functions for the Obsidian integration
 */

import path from 'path';
import crypto from 'crypto';

export class ObsidianUtils {
  /**
   * Sanitize a filename for Obsidian
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Generate a wikilink
   */
  static createWikilink(noteName, displayText = null) {
    const cleanName = noteName.replace(/\.md$/, '');
    return displayText ? `[[${cleanName}|${displayText}]]` : `[[${cleanName}]]`;
  }

  /**
   * Parse wikilinks from content
   */
  static parseWikilinks(content) {
    const linkRegex = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        target: match[1],
        displayText: match[3] || match[1],
        fullMatch: match[0]
      });
    }

    return links;
  }

  /**
   * Generate a unique ID
   */
  static generateId(prefix = 'id') {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Format date for Obsidian
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const formats = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'MMMM DD, YYYY': d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    return formats[format] || formats['YYYY-MM-DD'];
  }

  /**
   * Parse frontmatter from content
   */
  static parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { attributes: {}, body: content };
    }

    const frontmatterContent = match[1];
    const body = match[2];
    const attributes = {};

    // Simple YAML parsing (basic implementation)
    frontmatterContent.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1)
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''))
            .filter(item => item);
        }

        attributes[key] = value;
      }
    });

    return { attributes, body };
  }

  /**
   * Build frontmatter string
   */
  static buildFrontmatter(attributes) {
    if (!attributes || Object.keys(attributes).length === 0) {
      return '';
    }

    const lines = ['---'];
    
    for (const [key, value] of Object.entries(attributes)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          lines.push(`${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
        }
      } else if (value !== null && value !== undefined) {
        lines.push(`${key}: "${value}"`);
      }
    }
    
    lines.push('---', '');
    return lines.join('\n');
  }

  /**
   * Extract tags from content
   */
  static extractTags(content) {
    // Extract hashtags from content
    const hashtagRegex = /#([a-zA-Z0-9/_-]+)/g;
    const tags = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Build note path with proper folder structure
   */
  static buildNotePath(filename, folder = null, vaultPath = null) {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const noteFilename = sanitizedFilename.endsWith('.md') ? sanitizedFilename : `${sanitizedFilename}.md`;
    
    if (folder) {
      return path.join(folder, noteFilename);
    }
    
    return noteFilename;
  }

  /**
   * Generate a table of contents for a note
   */
  static generateTOC(content) {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const anchor = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      headings.push({
        level,
        title,
        anchor
      });
    }

    if (headings.length === 0) {
      return '';
    }

    const tocLines = ['## Table of Contents', ''];
    
    headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1);
      const link = `[[#${heading.title}|${heading.title}]]`;
      tocLines.push(`${indent}- ${link}`);
    });

    tocLines.push('');
    return tocLines.join('\n');
  }

  /**
   * Create a backlink section
   */
  static createBacklinkSection(backlinks) {
    if (!backlinks || backlinks.length === 0) {
      return '';
    }

    const lines = ['## Backlinks', ''];
    backlinks.forEach(link => {
      lines.push(`- ${this.createWikilink(link.source, link.context || link.source)}`);
    });
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Validate note content
   */
  static validateNoteContent(content, schema = {}) {
    const errors = [];
    
    if (typeof content !== 'string') {
      errors.push('Content must be a string');
      return errors;
    }

    if (content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }

    // Check for required frontmatter fields
    if (schema.required) {
      const { attributes } = this.parseFrontmatter(content);
      schema.required.forEach(field => {
        if (!attributes[field]) {
          errors.push(`Required frontmatter field missing: ${field}`);
        }
      });
    }

    // Check for malformed wikilinks
    const malformedLinks = content.match(/\[\[([^\]]*)\]\]/g);
    if (malformedLinks) {
      malformedLinks.forEach(link => {
        if (link.includes('[[[[') || link.includes(']]]]')) {
          errors.push(`Malformed wikilink: ${link}`);
        }
      });
    }

    return errors;
  }

  /**
   * Clean markdown content
   */
  static cleanMarkdown(content) {
    return content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
      .trim();
  }

  /**
   * Generate note summary
   */
  static generateSummary(content, maxLength = 200) {
    const { body } = this.parseFrontmatter(content);
    
    // Remove markdown formatting for summary
    const plainText = body
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, '$3 || $1') // Replace wikilinks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace markdown links
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find a good breaking point
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Create note metadata
   */
  static createNoteMetadata(noteData) {
    const now = new Date();
    
    return {
      id: this.generateId('note'),
      created: now.toISOString(),
      modified: now.toISOString(),
      version: '1.0.0',
      source: 'consulting_system',
      ...noteData
    };
  }

  /**
   * Parse Obsidian URI
   */
  static parseObsidianURI(uri) {
    const url = new URL(uri);
    
    if (url.protocol !== 'obsidian:') {
      throw new Error('Not a valid Obsidian URI');
    }

    return {
      action: url.hostname,
      vault: url.searchParams.get('vault'),
      file: url.searchParams.get('file'),
      line: url.searchParams.get('line'),
      params: Object.fromEntries(url.searchParams)
    };
  }

  /**
   * Create Obsidian URI
   */
  static createObsidianURI(action, params = {}) {
    const url = new URL(`obsidian://${action}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }
}

export default ObsidianUtils;