# Configuración de Autenticación Google OAuth

## Pasos para configurar Google OAuth 2.0

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google+ API (para autenticación)
   - Google Sheets API (para integración futura)
   - Google Maps JavaScript API (para mapas)

### 2. Configurar OAuth 2.0

1. Ve a "Credenciales" en el menú lateral
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
3. Selecciona "Aplicación web"
4. Configura los orígenes autorizados:
   - Para desarrollo: `http://localhost:3000`
   - Para producción: tu dominio
5. Configura las URIs de redirección autorizadas:
   - Para desarrollo: `http://localhost:3000`
   - Para producción: tu dominio

### 3. Configurar variables de entorno

#### Backend (.env)
```bash
# Copia backend/.env.template a backend/.env y completa:

NODE_ENV=development
PORT=5000

# Google OAuth (desde Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=tu_client_id_aqui
GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret_aqui

# JWT (genera una clave secreta segura)
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Para futuras integraciones
GOOGLE_SHEETS_API_KEY=tu_sheets_api_key_aqui
SPREADSHEET_ID=tu_spreadsheet_id_aqui
```

#### Frontend (.env)
```bash
# Copia frontend/.env.template a frontend/.env y completa:

# Google OAuth (mismo Client ID del backend)
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=tu_client_id_aqui

# Backend API
REACT_APP_API_URL=http://localhost:5000

# Para futuras integraciones
REACT_APP_GOOGLE_MAPS_API_KEY=tu_maps_api_key_aqui
```

### 4. Agregar usuarios autorizados

Una vez que el sistema esté funcionando, puedes agregar usuarios autorizados usando el endpoint de administrador:

```bash
# Primero, agrega manualmente un administrador en el código
# Edita backend/src/services/userService.ts y agrega tu email:

const authorizedUsers: Record<string, Omit<User, 'id' | 'lastLogin'>> = {
  'tu-email@gmail.com': {
    email: 'tu-email@gmail.com',
    name: 'Tu Nombre',
    role: 'administrador',
    googleId: '' // Se llenará automáticamente al hacer login
  }
};
```

### 5. Ejecutar el sistema

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

### 6. Probar la autenticación

1. Ve a `http://localhost:3000`
2. Haz clic en "Iniciar sesión con Google"
3. Autoriza la aplicación
4. Deberías ver el dashboard principal

## Roles de usuario

- **tecnico_campo**: Puede ver el mapa y registrar NAPs
- **tecnico_validador**: Puede validar y aprobar NAPs
- **administrador**: Acceso completo al sistema

## Próximos pasos

Una vez que la autenticación esté funcionando, puedes continuar con:

1. Integración con Google Sheets API (Tarea 3)
2. Desarrollo de la API REST para NAPs (Tarea 4)
3. Implementación del mapa interactivo (Tarea 5)
4. Panel de validación (Tarea 6)

## Solución de problemas

### Error: "Usuario no autorizado"
- Verifica que tu email esté en la lista de `authorizedUsers`
- Asegúrate de usar el mismo email de Google

### Error: "Token de Google inválido"
- Verifica que el `GOOGLE_OAUTH_CLIENT_ID` sea correcto
- Asegúrate de que el dominio esté autorizado en Google Cloud Console

### Error de CORS
- Verifica que `CORS_ORIGIN` en el backend coincida con la URL del frontend
- Para desarrollo local, debería ser `http://localhost:3000`