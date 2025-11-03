# 📡 Sistema de Gestión de NAPs

Sistema completo de gestión de Puntos de Acceso de Red (NAPs) con integración a Google Sheets, Google Maps y Google Forms.

## 🎯 Características

- 🗺️ **Dashboard web interactivo** con Google Maps
- 📊 **Integración con Google Sheets** como base de datos
- 📱 **Google Forms** para registro desde campo con código QR
- 🔐 **Sistema de autenticación** demo
- 🚀 **API REST completa**
- 📱 **Interfaz responsive** para móviles y desktop
- ⚡ **Tiempo real** - cambios instantáneos desde formularios

## 🚀 Deployment en Render

### Preparación Automática
```bash
# 1. Preparar proyecto
prepare-deployment.bat

# 2. Subir a GitHub  
deploy-to-github.bat
```

### Configuración en Render
1. Ve a [render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `nap-management-system`
4. Configura las variables de entorno (ver abajo)
5. Deploy automático

## 🔧 Variables de Entorno para Render

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=nap-sheets-service@automatizacion-tickets-472721.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[Tu clave privada completa aquí]
-----END PRIVATE KEY-----

GOOGLE_SPREADSHEET_ID=1hecaBkisyihs2igEuXXqnQAT7Yprih5hF3EWRZ9vcPo

GOOGLE_MAPS_API_KEY=AIzaSyCMi_blhIw3XagVkGdLvoABLTs5bU6UGhM
```

## 📊 Estructura del Sistema

### Flujo Completo
```
Técnico → QR Code → Google Forms → Google Sheets → Sistema Web → Mapa
   📱        ✅          ✅            ✅           🌐 24/7      ✅
```

### Arquitectura
- **Frontend**: React + TypeScript + Google Maps API
- **Backend**: Node.js + Express + Google Sheets API  
- **Base de datos**: Google Sheets (tiempo real)
- **Registro**: Google Forms con código QR
- **Hosting**: Render (gratuito)

## 🛠️ Desarrollo Local

### Instalación
```bash
# Instalar dependencias
npm run install-deps

# Desarrollo (frontend + backend separados)
npm run dev

# Producción (servidor unificado)
npm start
```

### URLs Locales
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📱 Google Forms

El sistema incluye Google Forms para registro desde campo:
- ✅ 13 campos mapeados a Google Sheets
- ✅ Código QR para acceso rápido
- ✅ Validaciones automáticas
- ✅ Subida de fotos
- ✅ Funciona offline

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- Rate limiting (100 req/15min)
- CORS configurado
- Variables de entorno para credenciales
- SSL/HTTPS automático en Render

## 📈 Monitoreo

- Health check endpoint: `/api/health`
- Logs en tiempo real en Render
- Performance monitoring incluido
- Error tracking automático

## 🔄 Actualizaciones

Para actualizar el sistema en producción:
```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Render actualiza automáticamente
```

## 📞 Soporte

- **Documentación**: Ver archivos `*.md` en el repositorio
- **Logs**: Dashboard de Render
- **Monitoreo**: `/api/health` endpoint

## 🎉 Características Avanzadas

- ⚡ **Tiempo real**: Cambios instantáneos desde Google Forms
- 🔄 **Auto-sync**: Sincronización automática con Google Sheets  
- 📱 **PWA Ready**: Funciona como app móvil
- 🌐 **Multi-dispositivo**: Acceso desde cualquier lugar
- 🔐 **Seguro**: Credenciales protegidas en variables de entorno

---

**Desarrollado para gestión profesional de infraestructura de red** 🚀