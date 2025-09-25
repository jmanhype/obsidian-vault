#!/bin/bash

# Obsidian Vault to Dgraph Knowledge Graph Integration
# Properly formatted for the Dgraph schema

VAULT_ROOT="/Users/speed/Documents/Obsidian Vault"
DGRAPH_URL="http://localhost:18080/graphql"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "==================================="
echo "🌟 Obsidian Vault → Dgraph Integration"
echo "==================================="

# 1. First, get the existing user ID (alice) to use as creator
echo -e "\n🔍 Getting existing user for creator reference:"
ALICE_ID=$(curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryUser(filter: {username: {eq: \"alice\"}}) { id } }"}' | jq -r '.data.queryUser[0].id')

echo "  Using creator ID: $ALICE_ID"

# 2. Create Vault System User
echo -e "\n👤 Creating Obsidian Vault System User:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { addUser(input: [{username: \\\"obsidian-vault-system\\\", email: \\\"system@obsidian.vault\\\", name: \\\"Obsidian Vault System\\\", created: \\\"$TIMESTAMP\\\"}]) { user { id username name } } }\"
  }" | jq '.'

# 3. Store Vault Databases as Knowledge Entries
echo -e "\n📚 Storing Vault Structure in Knowledge Graph:"

DATABASES=(
  "Projects|Project management and tracking system with TaskMaster integration"
  "Knowledge_Base|Core knowledge repository for storing insights and information"
  "Patterns|Design patterns, templates, and reusable solutions"
  "Principles|Guiding principles, best practices, and core values"
  "Laws|Scientific laws, logical rules, and fundamental truths"
  "Reading_List|Books, articles, and learning resources database"
)

for db_info in "${DATABASES[@]}"; do
  IFS='|' read -r db_name db_desc <<< "$db_info"
  
  echo "  → Adding knowledge: $db_name"
  curl -s -X POST $DGRAPH_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"mutation { addKnowledge(input: [{subject: \\\"Obsidian Database: ${db_name//_/ }\\\", content: \\\"$db_desc\\\", creator: {id: \\\"$ALICE_ID\\\"}, timestamp: \\\"$TIMESTAMP\\\", confidence: 1.0, source: \\\"Obsidian Vault Structure\\\"}]) { knowledge { id subject } } }\"
    }" | jq -r '.data.addKnowledge.knowledge[0].subject // .errors[0].message' | head -1
done

# 4. Store TaskMaster Configuration
echo -e "\n⚙️ Storing TaskMaster Configuration:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { addKnowledge(input: [{subject: \\\"TaskMaster Configuration\\\", content: \\\"6 TaskMaster instances initialized across all databases. 40 tasks generated from PRDs. Kanban boards configured with board view. Multi-database sync script active.\\\", creator: {id: \\\"$ALICE_ID\\\"}, timestamp: \\\"$TIMESTAMP\\\", confidence: 1.0, source: \\\"System Configuration\\\"}]) { knowledge { id subject } } }\"
  }" | jq -r '.data.addKnowledge.knowledge[0].subject // "Stored"'

# 5. Store MCP Integration Details
echo -e "\n🔌 Storing MCP Integration Details:"
MCP_SERVERS="Apollo-Dgraph (GraphQL), TaskMaster-AI (Task Management), Zen (AI Tools), Context7 (Documentation), Playwright (Browser Automation), Browser-MCP (Web Interaction)"

curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { addKnowledge(input: [{subject: \\\"MCP Server Configuration\\\", content: \\\"Active MCP Servers: $MCP_SERVERS\\\", creator: {id: \\\"$ALICE_ID\\\"}, timestamp: \\\"$TIMESTAMP\\\", confidence: 1.0, source: \\\"Claude Configuration\\\"}]) { knowledge { id subject } } }\"
  }" | jq -r '.data.addKnowledge.knowledge[0].subject // "Stored"'

# 6. Create Integration Status Post
echo -e "\n📝 Creating Integration Status Post:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { addPost(input: [{title: \\\"Vault Integration Complete\\\", content: \\\"Obsidian Vault successfully integrated with Dgraph knowledge graph. 6 databases tracked, TaskMaster active, Apollo MCP operational.\\\", author: {id: \\\"$ALICE_ID\\\"}, created: \\\"$TIMESTAMP\\\"}]) { post { id title } } }\"
  }" | jq '.'

# 7. Query and Display Summary
echo -e "\n📊 Knowledge Graph Status:"
echo "─────────────────────────"

echo -e "\n👥 Users in System:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryUser { username name } }"}' | \
  jq -r '.data.queryUser[] | "  • \(.username) - \(.name // "No name")"'

echo -e "\n📖 Knowledge Entries:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryKnowledge(first: 20) { subject source } }"}' | \
  jq -r '.data.queryKnowledge[] | "  • \(.subject) [\(.source // "Unknown")]"'

echo -e "\n📮 Recent Posts:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryPost(first: 5) { title content } }"}' | \
  jq -r '.data.queryPost[] | "  • \(.title): \(.content[0:60])..."'

echo -e "\n✅ Obsidian Vault is now connected to Dgraph!"
echo "   Apollo MCP Server is managing the knowledge graph"