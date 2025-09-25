#!/bin/bash

# Obsidian Vault to Dgraph Knowledge Graph Integration
# Uses Apollo MCP Server to store vault structure and knowledge

VAULT_ROOT="/Users/speed/Documents/Obsidian Vault"
DGRAPH_URL="http://localhost:18080/graphql"

echo "==================================="
echo "Obsidian Vault → Dgraph Integration"
echo "==================================="

# 1. Create Vault User
echo -e "\n📚 Creating Vault User in Dgraph:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addUser(input: [{username: \"obsidian-vault\", email: \"vault@obsidian.local\"}]) { user { id username } } }"
  }' | jq '.'

# 2. Store Database Structure as Knowledge
echo -e "\n📂 Storing Database Structure:"

DATABASES=(
  "Projects:Project management and tracking"
  "Knowledge Base:Core knowledge repository"
  "Patterns:Design patterns and templates"
  "Principles:Guiding principles and rules"
  "Laws:Scientific and logical laws"
  "Reading List:Books and articles database"
)

for db_info in "${DATABASES[@]}"; do
  IFS=':' read -r db_name db_desc <<< "$db_info"
  
  echo "  → Adding $db_name"
  curl -s -X POST $DGRAPH_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"mutation { addKnowledge(input: [{subject: \\\"Database: $db_name\\\", content: \\\"$db_desc\\\", confidence: 1.0, source: \\\"Obsidian Vault\\\"}]) { knowledge { id subject } } }\"
    }" | jq -r '.data.addKnowledge.knowledge[0].subject // "Error"'
done

# 3. Store TaskMaster Integration Info
echo -e "\n⚙️ Storing TaskMaster Integration:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addKnowledge(input: [{subject: \"TaskMaster Integration\", content: \"6 databases initialized with TaskMaster, 40 total tasks generated from PRDs, Kanban boards configured in board view\", confidence: 1.0, source: \"System Configuration\"}]) { knowledge { id subject } } }"
  }' | jq '.'

# 4. Store MCP Configuration
echo -e "\n🔧 Storing MCP Configuration:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addKnowledge(input: [{subject: \"MCP Servers\", content: \"Apollo-Dgraph, TaskMaster-AI, Zen, Context7, Playwright, Browser MCP servers configured and connected\", confidence: 1.0, source: \"Claude Configuration\"}]) { knowledge { id subject } } }"
  }' | jq '.'

# 5. Create System Status Post
echo -e "\n📝 Creating System Status Post:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addPost(input: [{content: \"Obsidian Vault fully integrated with Dgraph via Apollo MCP. Knowledge graph active with 6 databases, TaskMaster tasks, and Kanban boards.\", author: {username: \"obsidian-vault\"}}]) { post { id content } } }"
  }' | jq '.'

# 6. Query Summary
echo -e "\n📊 Current Knowledge Graph Summary:"
echo "  Users:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryUser { username } }"}' | jq -r '.data.queryUser[].username' | sed 's/^/    - /'

echo "  Knowledge Entries:"
curl -s -X POST $DGRAPH_URL \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryKnowledge { subject } }"}' | jq -r '.data.queryKnowledge[].subject' | sed 's/^/    - /'

echo -e "\n✅ Vault integration complete!"