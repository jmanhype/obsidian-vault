/**
 * Obsidian Integration Example
 * 
 * Example usage of the Obsidian integration system
 */

import { ObsidianIntegration } from './index.js';
import { ObsidianConfig } from './config.js';
import { ObsidianUtils } from './utils.js';

// Mock MCP client for demonstration
class MockMCPClient {
  async callTool(server, tool, args) {
    console.log(`[MCP] Calling ${server}.${tool} with args:`, args);
    
    // Simulate successful responses
    switch (tool) {
      case 'list_notes':
        return {
          content: [{
            type: 'text',
            text: 'Found 5 notes:\n\n**Example Client** (Clients/Example Client.md)\n- Modified: 2025-09-08T12:00:00Z\n- Size: 1024 bytes\n- Tags: client, consulting'
          }]
        };
      
      case 'create_note':
        return {
          content: [{
            type: 'text',
            text: `Successfully created note: ${args.folder ? args.folder + '/' : ''}${args.title}.md`
          }]
        };
      
      case 'search_vault':
        return {
          content: [{
            type: 'text',
            text: `Found 3 notes matching "${args.query}":\n\n**Project Alpha** (Projects/Project Alpha.md)\n- Match type: content\n- Excerpt: This project involves ${args.query}...\n- Modified: 2025-09-08T12:00:00Z`
          }]
        };
      
      case 'get_graph':
        return {
          content: [{
            type: 'text',
            text: 'Vault Graph Analysis:\n\nTotal Notes: 15\nTotal Connections: 23\n\nMost Connected Notes:\n- Client Dashboard: 8 connections\n- Project Overview: 6 connections\n- Weekly Review: 4 connections'
          }]
        };
      
      default:
        return {
          content: [{
            type: 'text',
            text: `Mock response for ${tool}`
          }]
        };
    }
  }
}

async function runExample() {
  console.log('🚀 Obsidian Integration Example\n');

  try {
    // 1. Create configuration
    console.log('1. Setting up configuration...');
    const config = new ObsidianConfig({
      vaultPath: '/Users/speed/Documents/Obsidian Vault',
      vaultName: 'Consulting Vault',
      syncEnabled: true,
      autoLinkEnabled: true
    });
    console.log('   ✅ Configuration created\n');

    // 2. Initialize integration
    console.log('2. Initializing integration...');
    const mcpClient = new MockMCPClient();
    const integration = new ObsidianIntegration(mcpClient, config.config);
    
    // Set up event listeners
    integration.on('note_created', (data) => {
      console.log(`   📝 Note created: ${data.path}`);
    });
    
    integration.on('note_updated', (data) => {
      console.log(`   📝 Note updated: ${data.path}`);
    });
    
    integration.on('error', (error) => {
      console.error(`   ❌ Error: ${error.message}`);
    });

    await integration.initialize();
    console.log('   ✅ Integration initialized\n');

    // 3. Create sample client note
    console.log('3. Creating client note...');
    const sampleClient = {
      id: 'client_001',
      name: 'John Smith',
      company: 'Tech Innovations Inc',
      email: 'john@techinnovations.com',
      phone: '+1-555-0123',
      industry: 'Technology',
      status: 'active',
      notes: 'Initial consultation completed. Looking for digital transformation strategy.'
    };

    await integration.syncClientToNote(sampleClient);
    console.log('   ✅ Client note created\n');

    // 4. Create sample project note
    console.log('4. Creating project note...');
    const sampleProject = {
      id: 'project_001',
      name: 'Digital Transformation Initiative',
      clientId: 'client_001',
      clientName: 'Tech Innovations Inc',
      description: 'Comprehensive digital transformation project to modernize legacy systems.',
      startDate: '2025-09-01',
      endDate: '2025-12-31',
      status: 'active',
      budget: '$150,000',
      objectives: [
        'Modernize legacy systems',
        'Implement cloud infrastructure',
        'Train staff on new technologies'
      ],
      deliverables: [
        'System architecture design',
        'Migration plan',
        'Staff training program'
      ]
    };

    await integration.syncProjectToNote(sampleProject);
    console.log('   ✅ Project note created\n');

    // 5. Create sample meeting note
    console.log('5. Creating meeting note...');
    const sampleMeeting = {
      id: 'meeting_001',
      title: 'Project Kickoff Meeting',
      clientId: 'client_001',
      clientName: 'Tech Innovations Inc',
      projectId: 'project_001',
      projectName: 'Digital Transformation Initiative',
      date: new Date().toISOString(),
      time: '10:00 AM',
      duration: '2 hours',
      type: 'kickoff',
      attendees: ['John Smith (Client)', 'Sarah Johnson (PM)', 'Mike Davis (Tech Lead)'],
      agenda: [
        'Project overview and objectives',
        'Timeline and milestones',
        'Roles and responsibilities',
        'Communication plan'
      ],
      notes: 'Productive kickoff meeting. Client is enthusiastic about the project. Discussed technical requirements and constraints.',
      actionItems: [
        { task: 'Finalize technical requirements document', assignee: 'Mike Davis' },
        { task: 'Set up project management tools', assignee: 'Sarah Johnson' },
        { task: 'Schedule next technical review', assignee: 'John Smith' }
      ],
      nextSteps: 'Technical team will conduct detailed system analysis next week.',
      nextMeeting: '2025-09-15'
    };

    await integration.syncMeetingToNote(sampleMeeting);
    console.log('   ✅ Meeting note created\n');

    // 6. Create sample insight
    console.log('6. Creating insight note...');
    const sampleInsight = {
      id: 'insight_001',
      title: 'Legacy System Migration Strategy',
      category: 'technical',
      confidence: 8,
      source: 'system_analysis',
      description: 'Analysis of the current legacy systems reveals critical migration priorities.',
      findings: [
        'Customer database is the highest priority for migration',
        'Inventory system has complex dependencies',
        'Reporting system can be migrated in parallel'
      ],
      recommendations: [
        'Start with customer database migration',
        'Implement data validation processes',
        'Plan for 2-week parallel running period'
      ],
      projectId: 'project_001',
      clientId: 'client_001'
    };

    await integration.syncInsightToNote(sampleInsight);
    console.log('   ✅ Insight note created\n');

    // 7. Demonstrate search functionality
    console.log('7. Testing search functionality...');
    const searchResult = await integration.searchNotes('digital transformation', {
      searchType: 'both',
      limit: 5
    });
    console.log('   📋 Search completed\n');

    // 8. Demonstrate graph analysis
    console.log('8. Analyzing vault graph...');
    const graphResult = await integration.getVaultGraph({
      maxDepth: 2,
      includeOrphans: false
    });
    console.log('   📊 Graph analysis completed\n');

    // 9. Demonstrate utilities
    console.log('9. Testing utilities...');
    
    const wikilink = ObsidianUtils.createWikilink('Tech Innovations Inc', 'Our Client');
    console.log(`   📎 Created wikilink: ${wikilink}`);
    
    const sanitized = ObsidianUtils.sanitizeFilename('Project: "Digital" Transformation <2025>');
    console.log(`   🧹 Sanitized filename: ${sanitized}`);
    
    const formattedDate = ObsidianUtils.formatDate(new Date(), 'MMMM DD, YYYY');
    console.log(`   📅 Formatted date: ${formattedDate}`);
    
    const uniqueId = ObsidianUtils.generateId('example');
    console.log(`   🆔 Generated ID: ${uniqueId}\n`);

    // 10. Show integration status
    console.log('10. Integration status:');
    const status = integration.getStatus();
    console.log('   📊 Status:', JSON.stringify(status, null, 4));
    console.log('   ✅ Example completed successfully!\n');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample();
}

export { runExample };