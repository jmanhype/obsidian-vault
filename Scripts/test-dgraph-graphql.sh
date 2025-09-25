#!/bin/bash

# Test Dgraph GraphQL Operations
echo "Testing Dgraph GraphQL at http://localhost:18080/graphql"
echo "==========================================="

# Test 1: Schema Introspection
echo -e "\n1. Testing Schema Introspection:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types[0:5]'

# Test 2: Create a User (mutation)
echo -e "\n2. Creating a test user:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateUser($input: AddUserInput!) { addUser(input: $input) { user { id username } } }",
    "variables": {
      "input": {
        "username": "testuser_'$(date +%s)'",
        "email": "test@example.com"
      }
    }
  }' | jq '.'

# Test 3: Query Users
echo -e "\n3. Querying all users:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryUser { id username email } }"}' | jq '.'

# Test 4: Create Knowledge Entry
echo -e "\n4. Creating a knowledge entry:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateKnowledge($input: AddKnowledgeInput!) { addKnowledge(input: $input) { knowledge { id title content } } }",
    "variables": {
      "input": {
        "title": "Test Knowledge Entry",
        "content": "This is a test knowledge entry created at '$(date)'",
        "tags": ["test", "dgraph", "graphql"]
      }
    }
  }' | jq '.'

# Test 5: Query Knowledge
echo -e "\n5. Querying knowledge entries:"
curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ queryKnowledge { id title content tags } }"}' | jq '.'

echo -e "\n==========================================="
echo "Dgraph GraphQL tests completed!"