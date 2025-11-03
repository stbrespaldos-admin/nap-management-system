const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

console.log('🚀 Starting NAP Management Server...');

// API Routes básicas
app.get('/api/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NAP Management API',
    message: 'Server is running successfully'
  });
});

// Mock data para pruebas
const mockNaps = [
  {
    id: 'STBNAP-NC-046',
    coordinates: { latitude: 1.2136, longitude: -77.2811 },
    status: 'instalada',
    registeredBy: 'Técnico Demo',
    registrationDate: '2024-11-01',
    municipality: 'Sandona',
    sector: 'Centro'
  },
  {
    id: 'STBNAP-RO-001', 
    coordinates: { latitude: 1.2000, longitude: -77.2500 },
    status: 'pendiente',
    registeredBy: 'Técnico Campo',
    registrationDate: '2024-11-02',
    municipality: 'Pasto',
    sector: 'Norte'
  }
];

// Get all NAPs (mock data por ahora)
app.get('/api/naps', (req, res) => {
  console.log('📋 NAPs requested');
  res.json(mockNaps);
});

// Get single NAP
app.get('/api/naps/:id', (req, res) => {
  const napId = req.params.id;
  console.log(`🔍 NAP requested: ${napId}`);
  
  const nap = mockNaps.find(n => n.id === napId);
  if (!nap) {
    return res.status(404).json({ error: 'NAP not found' });
  }
  
  res.json(nap);
});

// Auth endpoints (demo)
app.post('/api/auth/google', (req, res) => {
  console.log('🔐 Demo login');
  res.json({
    user: {
      id: 'demo-123',
      email: 'demo@empresa.com',
      name: 'Usuario Demo'
    },
    token: 'demo-token-' + Date.now()
  });
});

// Serve React build files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ NAP Management Server running on port ${PORT}`);
  console.log(`🔗 Health: /api/health`);
  console.log(`📋 NAPs: /api/naps`);
  console.log(`🌐 Frontend: Static files served`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('👋 Server shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Server interrupted, shutting down');
  process.exit(0);
});