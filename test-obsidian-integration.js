#!/usr/bin/env node

/**
 * Test script for Obsidian Integration
 * 
 * This script tests the MCP server and integration module functionality
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';

const VAULT_PATH = '/Users/speed/Documents/Obsidian Vault';

class ObsidianIntegrationTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  async runTests() {
    console.log('🧪 Testing Obsidian Integration\n');
    
    // Test 1: Check MCP server files
    await this.test('MCP Server Files Exist', this.checkMCPServerFiles.bind(this));
    
    // Test 2: Check integration module files
    await this.test('Integration Module Files Exist', this.checkIntegrationFiles.bind(this));
    
    // Test 3: Check templates exist
    await this.test('Templates Exist', this.checkTemplates.bind(this));
    
    // Test 4: Check MCP configuration
    await this.test('MCP Configuration Valid', this.checkMCPConfig.bind(this));
    
    // Test 5: Test MCP server startup
    await this.test('MCP Server Starts', this.testMCPServerStartup.bind(this));
    
    // Test 6: Test integration module imports
    await this.test('Integration Module Imports', this.testIntegrationImports.bind(this));
    
    this.printResults();
  }

  async test(name, testFunction) {
    try {
      await testFunction();
      this.passed++;
      this.results.push(`✅ ${name}`);
      console.log(`✅ ${name}`);
    } catch (error) {
      this.failed++;
      this.results.push(`❌ ${name}: ${error.message}`);
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  async checkMCPServerFiles() {
    const mcpPath = path.join(VAULT_PATH, 'mcp-servers', 'obsidian-mcp');
    
    try {
      await readFile(path.join(mcpPath, 'package.json'));
      await readFile(path.join(mcpPath, 'index.js'));
    } catch (error) {
      throw new Error('MCP server files missing');
    }
  }

  async checkIntegrationFiles() {
    const integrationPath = path.join(VAULT_PATH, 'src', 'obsidian-integration');
    
    const files = [
      'index.js',
      'config.js', 
      'utils.js',
      'example.js',
      'package.json',
      'README.md'
    ];
    
    for (const file of files) {
      try {
        await readFile(path.join(integrationPath, file));
      } catch (error) {
        throw new Error(`Integration file missing: ${file}`);
      }
    }
  }

  async checkTemplates() {
    const templatesPath = path.join(VAULT_PATH, 'Templates');
    
    const templates = [
      'Client Profile Template.md',
      'Consulting Project Template.md',
      'Meeting Notes Template.md',
      'Insight Template.md'
    ];
    
    for (const template of templates) {
      try {
        await readFile(path.join(templatesPath, template));
      } catch (error) {
        throw new Error(`Template missing: ${template}`);
      }
    }
  }

  async checkMCPConfig() {
    const mcpConfigPath = path.join(VAULT_PATH, '.mcp.json');
    
    try {
      const configContent = await readFile(mcpConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      if (!config.mcpServers || !config.mcpServers['obsidian-mcp']) {
        throw new Error('Obsidian MCP server not configured');
      }
      
      const obsidianConfig = config.mcpServers['obsidian-mcp'];
      
      if (!obsidianConfig.command || !obsidianConfig.args) {
        throw new Error('MCP server command not properly configured');
      }
      
      if (!obsidianConfig.env || !obsidianConfig.env.VAULT_PATH) {
        throw new Error('MCP server environment variables not set');
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('.mcp.json file not found');
      }
      throw error;
    }
  }

  testMCPServerStartup() {
    return new Promise((resolve, reject) => {
      const mcpServerPath = path.join(VAULT_PATH, 'mcp-servers', 'obsidian-mcp', 'index.js');
      
      const server = spawn('node', [mcpServerPath], {
        env: {
          ...process.env,
          VAULT_PATH: VAULT_PATH,
          VAULT_NAME: 'Obsidian Vault'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stderr = '';
      
      server.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      server.on('spawn', () => {
        // Server started successfully
        setTimeout(() => {
          server.kill('SIGTERM');
          if (stderr.includes('Obsidian MCP server running on stdio')) {
            resolve();
          } else {
            reject(new Error('Server did not start properly'));
          }
        }, 1000);
      });
      
      server.on('error', (error) => {
        reject(new Error(`Server failed to start: ${error.message}`));
      });
      
      setTimeout(() => {
        if (!server.killed) {
          server.kill('SIGTERM');
          reject(new Error('Server startup timeout'));
        }
      }, 5000);
    });
  }

  async testIntegrationImports() {
    try {
      // Test that the modules can be imported without syntax errors
      const integrationPath = path.join(VAULT_PATH, 'src', 'obsidian-integration');
      
      // Try importing each module
      const { ObsidianIntegration } = await import(`file://${path.join(integrationPath, 'index.js')}`);
      const { ObsidianConfig } = await import(`file://${path.join(integrationPath, 'config.js')}`);
      const { ObsidianUtils } = await import(`file://${path.join(integrationPath, 'utils.js')}`);
      
      // Test basic functionality
      if (typeof ObsidianIntegration !== 'function') {
        throw new Error('ObsidianIntegration is not a constructor');
      }
      
      if (typeof ObsidianConfig !== 'function') {
        throw new Error('ObsidianConfig is not a constructor');
      }
      
      if (typeof ObsidianUtils !== 'function') {
        throw new Error('ObsidianUtils is not a constructor');
      }
      
      // Test utility functions
      const wikilink = ObsidianUtils.createWikilink('Test Note');
      if (!wikilink.includes('[[Test Note]]')) {
        throw new Error('Wikilink generation failed');
      }
      
      const sanitized = ObsidianUtils.sanitizeFilename('Test: File <Name>');
      if (sanitized.includes(':') || sanitized.includes('<') || sanitized.includes('>')) {
        throw new Error('Filename sanitization failed');
      }
      
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  printResults() {
    console.log('\n📊 Test Results');
    console.log('=' .repeat(50));
    
    this.results.forEach(result => console.log(result));
    
    console.log('=' .repeat(50));
    console.log(`Total: ${this.passed + this.failed} | Passed: ${this.passed} | Failed: ${this.failed}`);
    
    if (this.failed === 0) {
      console.log('🎉 All tests passed! Obsidian integration is ready to use.');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Start Claude Code with MCP support to use the integration');
    console.log('2. Run the example: cd src/obsidian-integration && node example.js');
    console.log('3. Check the README.md for detailed usage instructions');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ObsidianIntegrationTester();
  tester.runTests().catch(console.error);
}