# 🔧 Guía de Configuración de Google APIs

## Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente

## Paso 2: Habilitar APIs Necesarias

### 2.1 Google Maps JavaScript API
1. En el menú lateral, ve a **APIs y servicios > Biblioteca**
2. Busca "Maps JavaScript API"
3. Haz clic en **HABILITAR**

### 2.2 Google Sheets API
1. En la biblioteca de APIs, busca "Google Sheets API"
2. Haz clic en **HABILITAR**

## Paso 3: Crear Credenciales

### 3.1 API Key para Google Maps
1. Ve a **APIs y servicios > Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES > Clave de API**
3. Copia la clave generada
4. **IMPORTANTE**: Restringe la clave:
   - Haz clic en la clave creada
   - En "Restricciones de aplicación", selecciona "Referentes HTTP"
   - Agrega: `http://localhost:3000/*` y `http://localhost/*`
   - En "Restricciones de API", selecciona "Maps JavaScript API"
   - Guarda los cambios

### 3.2 Credenciales OAuth 2.0
1. En **Credenciales**, haz clic en **+ CREAR CREDENCIALES > ID de cliente de OAuth 2.0**
2. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo: **Externo**
   - Nombre de la aplicación: "Sistema de Gestión de NAPs"
   - Correo de soporte: tu email
   - Dominios autorizados: `localhost`
3. Crear credenciales OAuth:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: "NAP Management System"
   - URIs de origen autorizados: `http://localhost:3000`
   - URIs de redirección autorizados: `http://localhost:3000/auth/callback`
4. Copia el **ID de cliente** y **Secreto de cliente**

### 3.3 Cuenta de Servicio (para Google Sheets)
1. En **Credenciales**, haz clic en **+ CREAR CREDENCIALES > Cuenta de servicio**
2. Nombre: "nap-sheets-service"
3. Descripción: "Servicio para acceder a Google Sheets"
4. Haz clic en **CREAR Y CONTINUAR**
5. Rol: **Editor** (o "Sheets API > Editor de hojas de cálculo de Google")
6. Haz clic en **CONTINUAR** y **LISTO**
7. Haz clic en la cuenta de servicio creada
8. Ve a la pestaña **CLAVES**
9. **AGREGAR CLAVE > Crear clave nueva > JSON**
10. Descarga el archivo JSON

## Paso 4: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala "NAPs Database" o similar
4. En la primera fila, agrega estas columnas:
   ```
   ID | Nombre | Latitud | Longitud | Dirección | Estado | Tipo | Fecha_Instalación | Notas
   ```
5. Agrega algunos datos de ejemplo:
   ```
   1 | NAP Centro | 4.6097 | -74.0817 | Calle 26 #13-19 | Activo | Fibra | 2024-01-15 | NAP principal centro
   2 | NAP Norte | 4.6482 | -74.0776 | Carrera 15 #85-32 | Activo | Fibra | 2024-02-01 | NAP zona norte
   ```
6. Copia el ID de la hoja (está en la URL): `https://docs.google.com/spreadsheets/d/ID_DE_LA_HOJA/edit`
7. **IMPORTANTE**: Comparte la hoja con la cuenta de servicio:
   - Haz clic en **Compartir**
   - Agrega el email de la cuenta de servicio (está en el archivo JSON descargado)
   - Dale permisos de **Editor**

## Paso 5: Configurar Variables de Entorno

Ahora edita el archivo `.env` en la raíz del proyecto:

```bash
# Reemplaza estos valores con los tuyos:
GOOGLE_MAPS_API_KEY=tu_clave_de_api_de_maps
GOOGLE_SHEETS_API_KEY=tu_clave_de_api_de_sheets  # Usa la misma que Maps
GOOGLE_OAUTH_CLIENT_ID=tu_client_id_oauth
GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret_oauth
SPREADSHEET_ID=id_de_tu_hoja_de_google_sheets
```

Y en `frontend/.env.local`:
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=tu_clave_de_api_de_maps
```

## Paso 6: Configurar Cuenta de Servicio

Del archivo JSON descargado, necesitas extraer:
- `client_email`: Email de la cuenta de servicio
- `private_key`: Clave privada

Agrega estas variables al archivo `.env`:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=email_de_la_cuenta_de_servicio
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada_aqui\n-----END PRIVATE KEY-----"
```

## ✅ Verificación

Para verificar que todo está configurado:

1. **Verifica las APIs habilitadas**:
   - Ve a Google Cloud Console > APIs y servicios > Panel
   - Deberías ver "Maps JavaScript API" y "Google Sheets API" habilitadas

2. **Verifica las credenciales**:
   - Ve a Credenciales
   - Deberías tener: 1 API Key, 1 OAuth 2.0, 1 Cuenta de servicio

3. **Verifica la hoja**:
   - La hoja debe estar compartida con la cuenta de servicio
   - Debe tener la estructura de columnas correcta

## 🚨 Problemas Comunes

### Error: "API key not valid"
- Verifica que la API key esté correctamente copiada
- Asegúrate de que las restricciones incluyan `localhost`

### Error: "Access denied to Google Sheets"
- Verifica que la hoja esté compartida con la cuenta de servicio
- Revisa que el SPREADSHEET_ID sea correcto

### Error: "OAuth redirect URI mismatch"
- Verifica que las URIs de redirección incluyan `http://localhost:3000/auth/callback`

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador para errores específicos
2. Verifica los logs del backend: `npm run docker:logs:backend`
3. Usa el health check: `npm run health:check`