const http = require('http');

const DAGGER_PORT = 51393;  // Current Dagger session port
const PROXY_PORT = 9999;

// Create proxy server
const server = http.createServer((req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('Incoming request:', req.method, req.url);
    console.log('Body:', body);
    
    // Forward to Dagger with auth
    const options = {
      hostname: 'localhost',
      port: DAGGER_PORT,
      path: req.url,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Basic ' + Buffer.from('efc2d96b-0997-4456-bf58-3aa4ac038363:').toString('base64')
      }
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      let responseBody = '';
      
      proxyRes.on('data', (chunk) => {
        responseBody += chunk.toString();
      });
      
      proxyRes.on('end', () => {
        console.log('Dagger response status:', proxyRes.statusCode);
        console.log('Dagger response:', responseBody);
        
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        res.end(responseBody);
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    });
    
    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, () => {
  console.log(`Auth proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`Forwarding to Dagger on http://localhost:${DAGGER_PORT}`);
  console.log(`Session token: efc2d96b-0997-4456-bf58-3aa4ac038363`);
});