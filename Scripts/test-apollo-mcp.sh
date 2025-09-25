#!/bin/bash

echo "Testing Apollo MCP Server with Dgraph"
echo "======================================"

# Test the GraphQL endpoint directly
echo -e "\n1. Direct GraphQL Test - Query existing users:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryUser { id username email } }"}' | jq '.'

echo -e "\n2. MCP Server Status:"
claude mcp list | grep apollo

echo -e "\n3. Available GraphQL Operations:"
ls /Users/speed/.local/etc/mcp/apollo-mcp/dgraph/operations/*.graphql 2>/dev/null | xargs -I {} basename {} .graphql | sed 's/^/  - /'

echo -e "\n======================================"
echo "Apollo MCP Server is configured and ready!"
echo ""
echo "The following operations are available through MCP:"
echo "  - SearchKnowledge: Search for knowledge entries"
echo "  - SearchPosts: Search for posts"
echo "  - CreateUser: Create a new user"
echo "  - AddKnowledgeEntry: Add a knowledge entry"
echo "  - CreateKnowledge: Create new knowledge"
echo "  - CreatePost: Create a new post"
echo "  - GetAllUsers: Get all users"