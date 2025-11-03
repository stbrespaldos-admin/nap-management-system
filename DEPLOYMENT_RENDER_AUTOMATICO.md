# 🚀 Deployment Automático - GitHub + Render

## 🎯 Objetivo
Subir el sistema NAP Management a GitHub con comandos y deployar en Render automáticamente.

## 📊 Arquitectura Final
```
GitHub (código) → Render (hosting 24/7) → URL pública
     ↑                    ↑                    ↓
  Comandos Git      Deploy automático    Sistema accesible
```

---

## 🔧 **PASO 1: Preparar el Proyecto para Deployment**

### **1.1 Crear Estructura Unificada**
Vamos a unificar frontend y backend en una sola aplicación para Render.

### **1.2 Crear .gitignore**
```
node_modules/
.env
*.log
dist/
build/
.DS_Store
backend/config/google-service-account.json
frontend/build/
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### **1.3 Crear package.json principal**
```json
{
  "name": "nap-management-system",
  "version": "1.0.0",
  "description": "Sistema de Gestión de NAPs con Google Sheets",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "cd frontend && npm install && npm run build",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && node server-sheets.js",
    "client": "cd frontend && npm start",
    "install-deps": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "googleapis": "^126.0.0",
    "google-auth-library": "^10.4.2",
    "helmet": "^7.0.0",
    "compression": "^1.8.1",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["nap", "management", "google-sheets", "maps"],
  "author": "Tu Nombre",
  "license": "MIT"
}
```

---

## 🔧 **PASO 2: Crear Servidor Unificado**

### **2.1 Crear server.js (Archivo Principal)**
```javascript
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
```

---

## 🔧 **PASO 3: Scripts de Deployment Automático**

### **3.1 Script de Preparación**
```bash
# prepare-deployment.bat
@echo off
echo 🚀 Preparando proyecto para deployment...

echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install
call npm run build
cd ..

echo 📦 Instalando dependencias del backend...
cd backend  
call npm install
cd ..

echo 📦 Instalando dependencias principales...
call npm install

echo ✅ Proyecto preparado para deployment
pause
```

### **3.2 Script de Git Automático**
```bash
# deploy-to-github.bat
@echo off
echo 🚀 Subiendo proyecto a GitHub...

echo 📋 Inicializando Git...
git init

echo 📝 Agregando archivos...
git add .

echo 💾 Creando commit inicial...
git commit -m "Initial commit: NAP Management System ready for deployment"

echo 🔗 Conectando con GitHub...
set /p REPO_URL="Ingresa la URL de tu repositorio GitHub (https://github.com/usuario/repo.git): "
git remote add origin %REPO_URL%

echo 📤 Subiendo código...
git branch -M main
git push -u origin main

echo ✅ Código subido exitosamente a GitHub!
echo 🌐 Ahora puedes conectar Render con tu repositorio
pause
```

---

## 🔧 **PASO 4: Configuración para Render**

### **4.1 Crear render.yaml**
```yaml
services:
  - type: web
    name: nap-management
    env: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: GOOGLE_SERVICE_ACCOUNT_EMAIL
        sync: false
      - key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  
        sync: false
      - key: GOOGLE_SPREADSHEET_ID
        sync: false
      - key: GOOGLE_MAPS_API_KEY
        sync: false
```

### **4.2 Actualizar Frontend para Producción**
```javascript
// frontend/src/services/napService.ts
const API_URL = process.env.NODE_ENV === 'production' 
  ? '' // Mismo dominio en producción
  : 'http://localhost:5000';

export const napService = {
  async getNaps() {
    const response = await fetch(`${API_URL}/api/naps`);
    return response.json();
  },
  
  async getNap(id: string) {
    const response = await fetch(`${API_URL}/api/naps/${id}`);
    return response.json();
  }
};
```

---

## 🚀 **PASO 5: Comandos de Ejecución**

### **5.1 Preparar Proyecto**
```bash
# Ejecutar prepare-deployment.bat
prepare-deployment.bat
```

### **5.2 Subir a GitHub**
```bash  
# Ejecutar deploy-to-github.bat
deploy-to-github.bat
```

### **5.3 Configurar Render (Manual - Una sola vez)**
1. Ir a render.com
2. Conectar con GitHub
3. Seleccionar repositorio
4. Configurar variables de entorno:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_SPREADSHEET_ID`
   - `GOOGLE_MAPS_API_KEY`
5. Deploy automático

---

## 📋 **Variables de Entorno para Render**

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=nap-sheets-service@automatizacion-tickets-472721.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChbasKIb15Lwg6
[... tu clave completa ...]
-----END PRIVATE KEY-----

GOOGLE_SPREADSHEET_ID=1hecaBkisyihs2igEuXXqnQAT7Yprih5hF3EWRZ9vcPo

GOOGLE_MAPS_API_KEY=AIzaSyCMi_blhIw3XagVkGdLvoABLTs5bU6UGhM
```

---

## 🎯 **Resultado Final**

### **URLs del Sistema:**
- **Sistema Web**: https://nap-management.onrender.com
- **API**: https://nap-management.onrender.com/api/naps
- **Health Check**: https://nap-management.onrender.com/api/health

### **Flujo Completo:**
```
Técnico → QR → Google Forms → Google Sheets → Render (24/7) → Mapa Público
   📱      ✅        ✅            ✅           🌐 Nuevo        ✅
```

### **Beneficios:**
- ✅ **Acceso 24/7** desde cualquier lugar
- ✅ **Sin dependencia** de tu computadora
- ✅ **Actualizaciones automáticas** con git push
- ✅ **Dominio profesional** incluido
- ✅ **SSL/HTTPS** automático
- ✅ **Logs en tiempo real**

---

## 🔄 **Actualizaciones Futuras**

Para actualizar el sistema:
```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Render actualiza automáticamente en ~2 minutos
```

---

**¿Empezamos con la preparación del proyecto? Los scripts están listos para ejecutar con comandos.**