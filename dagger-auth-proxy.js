const http = require('http');
const httpProxy = require('http-proxy-middleware');

const DAGGER_PORT = 53719; // Current Dagger session port
const PROXY_PORT = 9999;

// Create proxy middleware
const proxy = httpProxy.createProxyMiddleware({
  target: `http://localhost:${DAGGER_PORT}`,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Add Dagger session authentication
    proxyReq.setHeader('Authorization', 'Basic YjBiZmQ5MjItNDVjOS00MjM4LTgxYTctNzNiMGRkMTdkYTU4Og==');
    
    // Log the request for debugging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Handle GraphQL introspection
    if (req.method === 'POST' && req.url === '/query') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        console.log('GraphQL Query:', body.substring(0, 200));
      });
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[${new Date().toISOString()}] Response: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ error: err.message }));
  }
});

// Create server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Forward to Dagger
  proxy(req, res);
});

server.listen(PROXY_PORT, () => {
  console.log(`🚀 Dagger Auth Proxy running on port ${PROXY_PORT}`);
  console.log(`   Forwarding to Dagger on port ${DAGGER_PORT}`);
  console.log(`   Session token: b0bfd922-45c9-4238-81a7-73b0dd17da58`);
});