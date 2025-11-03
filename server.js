const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "*.googleapis.com", "*.gstatic.com"],
      scriptSrc: ["'self'", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "https://sheets.googleapis.com"]
    }
  }
}));

app.use(compression());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

app.use(express.json());

// Google Sheets setup
let sheets;

async function initializeGoogleSheets() {
  try {
    console.log('🔧 Initializing Google Sheets...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });
    
    console.log('✅ Google Sheets initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets:', error.message);
    return false;
  }
}

// Auth endpoints for demo mode
app.post('/api/auth/google', (req, res) => {
  try {
    console.log('🔐 Demo login attempt');
    
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@empresa.com',
      name: 'Usuario Demo',
      picture: 'https://via.placeholder.com/150',
      role: 'admin',
      permissions: ['read', 'write', 'validate', 'admin']
    };
    
    const mockToken = 'demo-token-' + Date.now();
    
    console.log('✅ Demo login successful');
    res.json({
      user: mockUser,
      token: mockToken,
      message: 'Login exitoso en modo demo'
    });
    
  } catch (error) {
    console.error('❌ Demo login error:', error.message);
    res.status(500).json({ 
      error: 'Error en login demo',
      message: error.message 
    });
  }
});

app.get('/api/auth/profile', (req, res) => {
  try {
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@empresa.com',
      name: 'Usuario Demo',
      picture: 'https://via.placeholder.com/150',
      role: 'admin',
      permissions: ['read', 'write', 'validate', 'admin']
    };
    
    res.json({ user: mockUser });
    
  } catch (error) {
    console.error('❌ Profile error:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener perfil',
      message: error.message 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('👋 Demo logout');
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({ 
      error: 'Error en logout',
      message: error.message 
    });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NAP Management API',
    sheets: sheets ? 'connected' : 'disconnected'
  });
});

// Get all NAPs
app.get('/api/naps', async (req, res) => {
  try {
    console.log('📊 Fetching NAPs from Google Sheets...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A:N',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json([]);
    }
    
    const naps = rows.slice(1).map((row, index) => {
      return {
        id: row[1] || `NAP${index + 1}`,
        coordinates: {
          latitude: parseFloat(row[2]?.replace('°', '').replace(',', '.')) || 0,
          longitude: parseFloat(row[3]?.replace('°', '').replace(',', '.')) || 0,
        },
        status: row[4] || 'pendiente',
        registeredBy: row[5] || '',
        registrationDate: row[6] || '',
        validatedBy: row[7] || '',
        validationDate: row[8] || '',
        validationComments: row[9] || '',
        observations: row[10] || '',
        photos: row[11] ? row[11].split(',') : [],
        municipality: row[12] || '',
        sector: row[13] || '',
      };
    });
    
    console.log(`✅ Found ${naps.length} NAPs`);
    res.json(naps);
    
  } catch (error) {
    console.error('❌ Error fetching NAPs:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch NAPs',
      message: error.message 
    });
  }
});

// Get single NAP by ID
app.get('/api/naps/:id', async (req, res) => {
  try {
    const napId = req.params.id;
    console.log(`🔍 Fetching NAP with ID: ${napId}`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A:N',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'NAP not found' });
    }
    
    const napRow = rows.slice(1).find(row => row[1] === napId);
    if (!napRow) {
      return res.status(404).json({ error: 'NAP not found' });
    }
    
    const nap = {
      id: napRow[1],
      coordinates: {
        latitude: parseFloat(napRow[2]?.replace('°', '').replace(',', '.')) || 0,
        longitude: parseFloat(napRow[3]?.replace('°', '').replace(',', '.')) || 0,
      },
      status: napRow[4] || 'pendiente',
      registeredBy: napRow[5] || '',
      registrationDate: napRow[6] || '',
      validatedBy: napRow[7] || '',
      validationDate: napRow[8] || '',
      validationComments: napRow[9] || '',
      observations: napRow[10] || '',
      photos: napRow[11] ? napRow[11].split(',') : [],
      municipality: napRow[12] || '',
      sector: napRow[13] || '',
    };
    
    console.log(`✅ Found NAP: ${nap.id}`);
    res.json(nap);
    
  } catch (error) {
    console.error('❌ Error fetching NAP:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch NAP',
      message: error.message 
    });
  }
});

// Serve React build files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
async function startServer() {
  const sheetsInitialized = await initializeGoogleSheets();
  
  if (!sheetsInitialized) {
    console.error('❌ Failed to initialize Google Sheets. Server starting anyway...');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NAP Management Server running on port ${PORT}`);
    console.log(`📊 Google Sheets: ${sheets ? 'Connected' : 'Disconnected'}`);
    console.log(`🔗 Health check: /api/health`);
    console.log(`📋 NAPs API: /api/naps`);
  });
}

startServer();