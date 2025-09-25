---
type: knowledge
category: setup-guide
tags: [knowledge, apollo, dagger, mcp, setup, quickstart]
confidence: proven
date_documented: 2025-01-22
status: completed
related: [[Apollo Dagger Integration]]
---

# Apollo Dagger Setup Guide

## Completed Tasks
☒ Check current Dagger session status          
☒ List available Dagger functions in the schema
☒ Test container operations through MCP
☒ Execute Runestone-specific Dagger functions
☒ Document working integration examples

## Summary

The Apollo Dagger integration is now fully operational! We've successfully:

1. **Solved the authentication problem** by creating a proxy that injects auth headers
2. **Established working connection** between Claude Desktop and Dagger via Apollo MCP
3. **Executed Dagger functions** including compilation and module operations
4. **Documented the solution** with working examples and setup instructions

The integration enables natural language execution of CI/CD pipelines through Claude Desktop, demonstrating the power of combining Apollo's GraphQL capabilities with Dagger's containerization platform.

## Quick Setup Steps

### Prerequisites
- Dagger installed and configured
- Node.js for running the auth proxy
- Claude Desktop with MCP support

### Setup Process

#### 1. Check if Dagger session is running:
```bash
dagger session
```
This will show the current session port and token.

#### 2. Update the auth proxy with current session:
```javascript
// Edit dagger-auth-proxy.js and update:
// - Line 4: DAGGER_PORT (current session port)
// - Line 51: Session token in the Authorization header
```

#### 3. Start the auth proxy:
```bash
node dagger-auth-proxy.js
```

#### 4. Apollo MCP server configuration
The Apollo MCP server is already configured in Claude Desktop to use the proxy on port 9999.

## Usage

You can now use Apollo MCP functions through Claude Desktop with:

- `mcp__apollo-dagger-working__execute` - Run GraphQL queries
- `mcp__apollo-dagger-working__introspect` - Explore schema
- `mcp__apollo-dagger-working__search` - Search for operations

The proxy handles all authentication automatically, bridging Apollo MCP (which can't pass auth headers) to Dagger (which requires them).

## Architecture Flow
```
Claude Desktop 
    ↓
Apollo MCP Server
    ↓
Auth Proxy (port 9999)
    ↓ [injects auth headers]
Dagger GraphQL (dynamic port)
```

## Key Points
- The proxy solution elegantly solves the authentication header limitation in Apollo MCP
- Dagger session must be running for the integration to work
- Port 9999 is the stable endpoint that Apollo MCP connects to
- The proxy forwards to the dynamic Dagger session port

## Troubleshooting

### If connection fails:
1. Verify Dagger session is running: `dagger session`
2. Check proxy is running on port 9999: `lsof -i :9999`
3. Confirm token in dagger-auth-proxy.js matches current session
4. Restart Claude Desktop after configuration changes

### Common Issues:
- **Auth errors**: Update the session token in the proxy
- **Connection refused**: Start the Dagger session first
- **Port conflicts**: Ensure port 9999 is available

## Related Documentation
- [[Apollo Dagger Integration]] - Full integration details and examples
- [[Dagger CI/CD]] - Dagger platform documentation
- [[Apollo MCP Server]] - Apollo MCP server configuration