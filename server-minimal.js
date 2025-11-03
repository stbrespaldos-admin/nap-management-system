// Servidor mínimo para NAP Management System
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

console.log('🚀 Starting minimal NAP server...');

// Mock data
const mockNaps = [
  {
    id: 'STBNAP-NC-046',
    coordinates: { latitude: 1.2136, longitude: -77.2811 },
    status: 'instalada',
    municipality: 'Sandona'
  },
  {
    id: 'STBNAP-RO-001', 
    coordinates: { latitude: 1.2000, longitude: -77.2500 },
    status: 'pendiente',
    municipality: 'Pasto'
  }
];

// Simple server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`📝 Request: ${req.method} ${pathname}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API Routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'NAP Management API - Minimal Server',
      message: 'Server running successfully'
    }));
    return;
  }
  
  if (pathname === '/api/naps') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockNaps));
    return;
  }
  
  if (pathname.startsWith('/api/naps/')) {
    const napId = pathname.split('/')[3];
    const nap = mockNaps.find(n => n.id === napId);
    
    if (nap) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(nap));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'NAP not found' }));
    }
    return;
  }
  
  // Serve static files
  let filePath = path.join(__dirname, 'frontend/build', pathname === '/' ? 'index.html' : pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve index.html (for React routing)
      filePath = path.join(__dirname, 'frontend/build/index.html');
    }
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback HTML if no build files
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>NAP Management System</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .container { max-width: 800px; margin: 0 auto; }
              .status { color: green; font-weight: bold; }
              .api-link { color: blue; text-decoration: underline; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 NAP Management System</h1>
              <p class="status">✅ Servidor funcionando correctamente</p>
              
              <h2>📋 APIs Disponibles:</h2>
              <ul>
                <li><a href="/api/health" class="api-link">/api/health</a> - Estado del servidor</li>
                <li><a href="/api/naps" class="api-link">/api/naps</a> - Lista de NAPs</li>
                <li><a href="/api/naps/STBNAP-NC-046" class="api-link">/api/naps/STBNAP-NC-046</a> - NAP específico</li>
              </ul>
              
              <h2>📊 Datos de Prueba:</h2>
              <p>El sistema incluye 2 NAPs de prueba para verificar funcionamiento.</p>
              
              <h2>🔄 Próximos Pasos:</h2>
              <ol>
                <li>Verificar que las APIs funcionan</li>
                <li>Agregar variables de entorno</li>
                <li>Conectar con Google Sheets</li>
                <li>Habilitar frontend completo</li>
              </ol>
              
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `);
        return;
      }
      
      // Determine content type
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (ext) {
        case '.js': contentType = 'application/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.ico': contentType = 'image/x-icon'; break;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ NAP Management Server running on port ${PORT}`);
  console.log(`🔗 Health: /api/health`);
  console.log(`📋 NAPs: /api/naps`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Server shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 Server interrupted, shutting down');
  server.close(() => {
    process.exit(0);
  });
});