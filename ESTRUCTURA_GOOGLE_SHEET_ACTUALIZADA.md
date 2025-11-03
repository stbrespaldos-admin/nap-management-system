# 📊 Estructura ACTUALIZADA para Google Sheet

## URL de tu hoja:
https://docs.google.com/spreadsheets/d/1hecaBkisyihs2igEuXXqnQAT7Yprih5hF3EWRZ9vcPo/edit

## ⚠️ NUEVA ESTRUCTURA REQUERIDA (Fila 1 - Encabezados):

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Latitud | Longitud | Estado | Registrado Por | Fecha Registro | Validado Por | Fecha Validación | Comentarios Validación | Observaciones | Fotos | Municipio | Sector |

## Datos de ejemplo (Filas 2-4):

### Fila 2:
| NAP001 | 4.6097 | -74.0817 | pendiente | admin@empresa.com | 2024-01-15 | | | | NAP principal del centro | | Bogotá | Centro |

### Fila 3:
| NAP002 | 4.6482 | -74.0776 | activo | admin@empresa.com | 2024-02-01 | validator@empresa.com | 2024-02-05 | Validado correctamente | NAP zona norte | | Bogotá | Norte |

### Fila 4:
| NAP003 | 4.5709 | -74.0835 | validado | admin@empresa.com | 2024-01-20 | validator@empresa.com | 2024-01-25 | Aprobado para construcción | NAP zona sur | | Bogotá | Sur |

## Estados válidos:
- `pendiente` - Pendiente de validación
- `en_construccion` - En construcción
- `activo` - Activo y funcionando
- `validado` - Validado para construcción
- `rechazado` - Rechazado

## ⚠️ CAMBIOS IMPORTANTES:
1. **Encabezados en ESPAÑOL** (como espera el backend)
2. **Más columnas** para el proceso de validación
3. **IDs alfanuméricos** (NAP001, NAP002, etc.)
4. **Campos de validación** (Validado Por, Fecha Validación, Comentarios)
5. **Campos geográficos** (Municipio, Sector)

## 🔧 Pasos para reconfigurar:
1. Ve a tu Google Sheet
2. **BORRA TODO** el contenido actual
3. Copia exactamente los nuevos encabezados de la fila 1
4. Agrega los 3 ejemplos de NAPs en las filas 2-4
5. Guarda la hoja

## 📝 Notas:
- Las columnas G, H, I pueden estar vacías para NAPs pendientes
- Las coordenadas siguen siendo números decimales con punto
- Las fechas en formato YYYY-MM-DD