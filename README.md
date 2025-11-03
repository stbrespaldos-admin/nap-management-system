# Sistema de Gestión de NAPs

Sistema web para la gestión de Network Access Points (NAPs) con integración a Google Forms, Google Sheets y Google Maps.

## Estructura del Proyecto

```
nap-management-system/
├── frontend/          # Aplicación React (PWA)
├── backend/           # API Node.js/Express
├── .kiro/            # Especificaciones del proyecto
└── README.md         # Este archivo
```

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuentas de Google Cloud Platform con APIs habilitadas:
  - Google Maps JavaScript API
  - Google Sheets API
  - Google OAuth 2.0

## Configuración Inicial

### 1. Instalar Dependencias

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar Variables de Entorno

Copiar los archivos template y configurar las variables:

```bash
# Frontend
cp frontend/.env.template frontend/.env

# Backend
cp backend/.env.template backend/.env
```

Editar los archivos `.env` con las credenciales correspondientes.

### 3. Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## APIs de Google Requeridas

1. **Google Maps JavaScript API**: Para visualización de mapas
2. **Google Sheets API**: Para integración con hojas de cálculo
3. **Google OAuth 2.0**: Para autenticación de usuarios

## Funcionalidades Principales

- 🗺️ Visualización interactiva de NAPs en Google Maps
- 📝 Integración con Google Forms para registro en campo
- ✅ Sistema de validación de NAPs por técnicos
- 🔐 Autenticación segura con Google OAuth
- 📊 Sincronización automática con Google Sheets
- 📱 Diseño responsive (PWA)

## Tecnologías

### Frontend
- React 18 + TypeScript
- Google Maps API
- React Router
- Axios

### Backend
- Node.js + Express
- TypeScript
- Google APIs
- JWT Authentication
- Winston (Logging)

## Scripts Disponibles

### Frontend
- `npm start`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm test`: Ejecutar tests
- `npm run lint`: Linter
- `npm run format`: Formatear código

### Backend
- `npm run dev`: Servidor de desarrollo con nodemon
- `npm run build`: Compilar TypeScript
- `npm test`: Ejecutar tests
- `npm run lint`: Linter
- `npm run format`: Formatear código

## Contribución

1. Revisar las especificaciones en `.kiro/specs/nap-management-system/`
2. Seguir las tareas definidas en `tasks.md`
3. Mantener el código formateado con Prettier
4. Ejecutar tests antes de commits

## Licencia

MIT