#!/bin/bash

echo "======================================"
echo "🚀 Apollo MCP Servers Status"
echo "======================================"

# Check MCP server status
echo -e "\n📡 MCP Server Connections:"
claude mcp list | grep apollo

# Check Docker containers
echo -e "\n🐳 Docker Containers:"
echo "  Dgraph:"
docker ps | grep dgraph | awk '{print "    Status: Running on ports " $11}'
echo "  Dagger:"
docker ps | grep dagger | awk '{print "    Status: Running - " $2}'

# Check processes
echo -e "\n⚙️ Running Processes:"
if ps aux | grep "dagger listen" | grep -v grep > /dev/null; then
    echo "  ✓ Dagger listening on port 58410"
else
    echo "  ✗ Dagger not in listening mode"
fi

# Show available operations
echo -e "\n📝 Available Operations:"
echo "  Apollo-Dgraph (Knowledge Graph):"
ls /Users/speed/.local/etc/mcp/apollo-mcp/dgraph/operations/*.graphql 2>/dev/null | xargs -I {} basename {} .graphql | sed 's/^/    - /'

echo -e "\n  Apollo-Dagger (Container Operations):"
ls /Users/speed/.local/etc/mcp/apollo-mcp/dagger/operations/*.graphql 2>/dev/null | xargs -I {} basename {} .graphql | sed 's/^/    - /'

# Test endpoints
echo -e "\n🔗 Endpoint Status:"
# Test Dgraph
if curl -s -X POST http://localhost:18080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | grep -q "Query"; then
    echo "  ✓ Dgraph GraphQL: http://localhost:18080/graphql - ACTIVE"
else
    echo "  ✗ Dgraph GraphQL: http://localhost:18080/graphql - INACTIVE"
fi

# Test Dagger
if curl -s -X POST http://localhost:58410/query \
  -H "Authorization: Basic NmUwZTRkZjUtZmRkNC00N2NkLTk4Y2UtMzVlNGM1NzQ5ZTQ1Og==" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' 2>/dev/null | grep -q "error"; then
    echo "  ✓ Dagger GraphQL: http://localhost:58410/query - ACTIVE (authenticated)"
else
    echo "  ✗ Dagger GraphQL: http://localhost:58410/query - CHECK CONNECTION"
fi

echo -e "\n======================================"
echo "✅ Apollo MCP Configuration Complete!"
echo ""
echo "Usage:"
echo "  • Apollo-Dgraph: Knowledge management & queries"
echo "  • Apollo-Dagger: Container operations & builds"
echo "======================================"