# 🔑 Obtener Nueva Clave de Cuenta de Servicio

## Si no tienes el archivo JSON original:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Asegúrate de estar en el proyecto `automatizacion-tickets-472721`
3. **APIs y servicios** → **Credenciales**
4. Busca tu cuenta de servicio: `nap-sheets-service@automatizacion-tickets-472721.iam.gserviceaccount.com`
5. **Haz clic en ella**
6. Ve a la pestaña **CLAVES**
7. **AGREGAR CLAVE** → **Crear clave nueva** → **JSON**
8. **CREAR** (se descargará un nuevo archivo JSON)

## Extraer la clave privada:

Del archivo JSON descargado, busca el campo `"private_key"` que se ve así:

```json
{
  "type": "service_account",
  "project_id": "automatizacion-tickets-472721",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "nap-sheets-service@automatizacion-tickets-472721.iam.gserviceaccount.com",
  ...
}
```

**Copia TODO el contenido del campo `"private_key"` (incluyendo las comillas)**