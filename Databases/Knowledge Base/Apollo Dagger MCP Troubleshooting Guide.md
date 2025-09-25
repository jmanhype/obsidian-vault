# Apollo Dagger MCP Troubleshooting Guide

#mcp #dagger #troubleshooting #graphql #proxy

## Overview

Complete guide for setting up and troubleshooting the Apollo Dagger MCP (Model Context Protocol) server integration with Dagger GraphQL API.

## Key Components

1. **Apollo Dagger MCP Server**: Provides GraphQL interface to Dagger operations
2. **Dagger Session**: Runs on dynamic ports (e.g., 59066) with session-based auth
3. **HTTP Proxy**: Bridges MCP server (port 9999) to Dagger session with authentication

## Critical Insights

- **Session Management**: Each `dagger session` command creates a NEW session, don't run it repeatedly
- **Port Discovery**: Use `lsof -i -P | grep dagger | grep LISTEN` to find active Dagger ports
- **Authentication**: Uses Basic Auth with session token: `Basic ${base64(token + ':')}`
- **Docker Required**: Docker Desktop MUST be running or Dagger won't start
- **Dagger Listen**: Use `export DAGGER_SESSION_TOKEN=<token> && dagger listen --allow-cors --listen 0.0.0.0:8090` for persistent GraphQL server
- **HTTP/2 Issue**: `dagger listen` creates HTTP/2 server that doesn't work with standard HTTP/1.1 clients - proxy required

## Working Proxy Pattern

```bash
# Kill existing proxy and start with fixed session
kill $(lsof -t -i:9999) 2>/dev/null
DAGGER_PORT=59066 DAGGER_TOKEN="session-token-here" node -e "
const http = require('http');
const DAGGER_PORT = parseInt(process.env.DAGGER_PORT);
const DAGGER_TOKEN = process.env.DAGGER_TOKEN;
const PROXY_PORT = 9999;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const options = {
      hostname: 'localhost',
      port: DAGGER_PORT,
      path: req.url,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Basic ' + Buffer.from(DAGGER_TOKEN + ':').toString('base64')
      }
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      let responseBody = '';
      proxyRes.on('data', chunk => responseBody += chunk.toString());
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        res.end(responseBody);
      });
    });
    
    proxyReq.on('error', (e) => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });
    
    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, () => {
  console.log('✅ Proxy ready on port ' + PROXY_PORT);
});
"
```

## Troubleshooting Steps

1. **Check existing Dagger sessions**: `lsof -i -P | grep dagger | grep LISTEN`
2. **Find session token** from last successful `dagger session` output
3. **Kill existing proxy**: `kill $(lsof -t -i:9999)`
4. **Start proxy** with correct port and token using the pattern above
5. **Test** with Apollo Dagger MCP operations

## Common Errors

| Error | Cause | Solution |
|-------|--------|----------|
| **Connection refused** | Wrong port or no active Dagger session | Check `lsof` output for correct port |
| **401 Unauthorized** | Missing or incorrect session token | Use token from active Dagger session |
| **MCP -32603 error** | Proxy not running on port 9999 | Start proxy on correct port |
| **Docker daemon not running** | Docker Desktop not started | Run `open -a Docker` and wait for startup |
| **ECONNRESET** | HTTP/2 vs HTTP/1.1 mismatch | Use proxy, not direct connection |
| **EADDRINUSE :9999** | Port already in use | Kill existing: `lsof -i :9999 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| **Session port closes immediately** | Using `dagger session` port directly | Use `dagger listen` with session token instead |

## Available MCP Operations

Once working, you can use these Apollo Dagger MCP operations:

- `mcp__apollo-dagger__ContainerFrom` - Create container from image
- `mcp__apollo-dagger__ContainerWithExec` - Execute commands in containers
- `mcp__apollo-dagger__HostDirectory` - Access host directories
- `mcp__apollo-dagger__RunestoneBuild/Test` - Runestone project workflows

## Files Referenced

- [[dagger-auth-proxy.js]] - Original proxy implementation
- [[apollo-dagger-proxy.js]] - Alternative proxy version
- `/tmp/dagger-proxy.js` - Working proxy implementation

## Related

- [[MCP Servers Configuration]]
- [[Dagger GraphQL API]]
- [[Container Operations]]

---
*Created: 2025-01-08*
*Last Updated: 2025-01-08*
*Status: Verified Working*