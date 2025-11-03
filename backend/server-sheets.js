const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Google Sheets setup
let sheets;
let auth;

async function initializeGoogleSheets() {
  try {
    console.log('🔧 Initializing Google Sheets...');
    
    auth = new google.auth.GoogleAuth({
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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const sheetsStatus = sheets ? 'connected' : 'disconnected';
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'NAP Management API',
      sheets: sheetsStatus
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Auth endpoints for demo mode
app.post('/api/auth/google', (req, res) => {
  try {
    console.log('🔐 Demo login attempt');
    
    // Create a mock user for demo purposes
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@empresa.com',
      name: 'Usuario Demo',
      picture: 'https://via.placeholder.com/150',
      role: 'admin',
      permissions: ['read', 'write', 'validate', 'admin']
    };
    
    // Create a simple mock token
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
    // Return the same mock user for demo
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

// Get all NAPs
app.get('/api/naps', async (req, res) => {
  try {
    console.log('📊 Fetching NAPs from Google Sheets...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A:N', // All columns A through N (incluye nueva columna)
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json([]);
    }
    
    // Skip header row and convert to NAP objects
    const headers = rows[0];
    const naps = rows.slice(1).map((row, index) => {
      return {
        id: row[1] || `NAP${index + 1}`, // Columna B (era A)
        coordinates: {
          latitude: parseFloat(row[2]?.replace('°', '').replace(',', '.')) || 0, // Columna C (era B)
          longitude: parseFloat(row[3]?.replace('°', '').replace(',', '.')) || 0, // Columna D (era C)
        },
        status: row[4] || 'pendiente', // Columna E (era D)
        registeredBy: row[5] || '', // Columna F (era E)
        registrationDate: row[6] || '', // Columna G (era F)
        validatedBy: row[7] || '', // Columna H (era G)
        validationDate: row[8] || '', // Columna I (era H)
        validationComments: row[9] || '', // Columna J (era I)
        observations: row[10] || '', // Columna K (era J)
        photos: row[11] ? row[11].split(',') : [], // Columna L (era K)
        municipality: row[12] || '', // Columna M (era L)
        sector: row[13] || '', // Columna N (era M)
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
    
    // Find the NAP by ID (ahora en columna B)
    const napRow = rows.slice(1).find(row => row[1] === napId);
    if (!napRow) {
      return res.status(404).json({ error: 'NAP not found' });
    }
    
    const nap = {
      id: napRow[1], // Columna B
      coordinates: {
        latitude: parseFloat(napRow[2]?.replace('°', '').replace(',', '.')) || 0, // Columna C
        longitude: parseFloat(napRow[3]?.replace('°', '').replace(',', '.')) || 0, // Columna D
      },
      status: napRow[4] || 'pendiente', // Columna E
      registeredBy: napRow[5] || '', // Columna F
      registrationDate: napRow[6] || '', // Columna G
      validatedBy: napRow[7] || '', // Columna H
      validationDate: napRow[8] || '', // Columna I
      validationComments: napRow[9] || '', // Columna J
      observations: napRow[10] || '', // Columna K
      photos: napRow[11] ? napRow[11].split(',') : [], // Columna L
      municipality: napRow[12] || '', // Columna M
      sector: napRow[13] || '', // Columna N
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

// Update NAP status
app.put('/api/naps/:id', async (req, res) => {
  try {
    const napId = req.params.id;
    const updates = req.body;
    console.log(`📝 Updating NAP ${napId}:`, updates);
    
    // First, find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A:N',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'NAP not found' });
    }
    
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[1] === napId); // Buscar en columna B
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'NAP not found' });
    }
    
    // Update the row
    const currentRow = rows[rowIndex];
    const updatedRow = [...currentRow];
    
    // Update specific fields based on the request (ajustado para nueva estructura)
    if (updates.status) updatedRow[4] = updates.status; // Columna E
    if (updates.validatedBy) updatedRow[7] = updates.validatedBy; // Columna H
    if (updates.validationDate) updatedRow[8] = updates.validationDate; // Columna I
    if (updates.validationComments) updatedRow[9] = updates.validationComments; // Columna J
    if (updates.observations) updatedRow[10] = updates.observations; // Columna K
    
    // Update the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: `A${rowIndex + 1}:N${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [updatedRow]
      }
    });
    
    console.log(`✅ Updated NAP ${napId}`);
    res.json({ message: 'NAP updated successfully', id: napId });
    
  } catch (error) {
    console.error('❌ Error updating NAP:', error.message);
    res.status(500).json({ 
      error: 'Failed to update NAP',
      message: error.message 
    });
  }
});

// Start server
async function startServer() {
  const sheetsInitialized = await initializeGoogleSheets();
  
  if (!sheetsInitialized) {
    console.error('❌ Failed to initialize Google Sheets. Server not started.');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 NAP Management Server running on port ${PORT}`);
    console.log(`📊 Google Sheets: Connected`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 NAPs API: http://localhost:${PORT}/api/naps`);
  });
}

startServer();