import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NAP Management API (Simple Mode)',
    message: 'Backend funcionando - Modo de pruebas'
  });
});

// Auth endpoints (simplified)
app.post('/api/auth/google', (req, res) => {
  // Simulate successful authentication
  const mockUser = {
    id: '1',
    email: 'usuario@test.com',
    name: 'Usuario de Prueba',
    role: 'admin'
  };
  
  const mockToken = 'mock-jwt-token-for-testing';
  
  res.json({
    success: true,
    user: mockUser,
    token: mockToken
  });
});

app.get('/api/auth/me', (req, res) => {
  // Return mock user info
  res.json({
    id: '1',
    email: 'usuario@test.com',
    name: 'Usuario de Prueba',
    role: 'admin'
  });
});

// NAPs endpoints (mock data)
app.get('/api/naps', (req, res) => {
  const mockNaps = [
    {
      id: '1',
      name: 'NAP Centro',
      coordinates: {
        latitude: 4.6097,
        longitude: -74.0817
      },
      address: 'Calle 26 #13-19, Bogotá',
      status: 'active',
      type: 'fiber',
      installationDate: '2024-01-15',
      notes: 'NAP principal del centro',
      lastValidation: '2024-01-15T10:00:00Z',
      validatedBy: 'admin'
    },
    {
      id: '2',
      name: 'NAP Norte',
      coordinates: {
        latitude: 4.6482,
        longitude: -74.0776
      },
      address: 'Carrera 15 #85-32, Bogotá',
      status: 'active',
      type: 'fiber',
      installationDate: '2024-02-01',
      notes: 'NAP zona norte',
      lastValidation: '2024-02-01T10:00:00Z',
      validatedBy: 'admin'
    },
    {
      id: '3',
      name: 'NAP Sur',
      coordinates: {
        latitude: 4.5709,
        longitude: -74.0835
      },
      address: 'Avenida Caracas #45-67, Bogotá',
      status: 'maintenance',
      type: 'fiber',
      installationDate: '2024-01-20',
      notes: 'En mantenimiento programado',
      lastValidation: '2024-01-20T10:00:00Z',
      validatedBy: 'admin'
    }
  ];
  
  res.json(mockNaps);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend simple running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Mode: Testing/Development`);
});

export default app;