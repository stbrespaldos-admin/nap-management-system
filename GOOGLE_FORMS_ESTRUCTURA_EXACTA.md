# 📋 Google Forms - Estructura EXACTA según tu Hoja Actual

## 📊 Estructura Actual de tu Google Sheet

**Columnas actuales (A-M):**
```
A: ID 
B: Latitud 
C: Longitud 
D: Estado
E: Registrado Por
F: Fecha Registro
G: Validado Por
H: Fecha Validación
I: Comentarios Validación
J: Observaciones
K: Fotos
L: Municipio
M: Sector
```

---

## 📝 Campos del Google Forms (Mapeo Exacto)

### **Título del Formulario:**
`📡 Registro de NAP - Sistema de Gestión`

### **Descripción:**
```
Formulario para técnicos de campo - Registro de NAPs

⚠️ Campos obligatorios marcados con *
📍 Tomar coordenadas GPS exactas en el sitio
```

---

## 🔧 Campos del Formulario (Orden Exacto)

### **Campo 1: ID del NAP** → Columna A
- **Tipo**: Respuesta corta
- **Pregunta**: "ID del NAP *"
- **Descripción**: "Formato: STBNAP-XX-### (ej: STBNAP-NC-047)"
- **Obligatorio**: ✅ SÍ
- **Validación**: Texto obligatorio

### **Campo 2: Latitud** → Columna B  
- **Tipo**: Respuesta corta
- **Pregunta**: "Latitud *"
- **Descripción**: "Formato decimal con coma (ej: 1,230764)"
- **Obligatorio**: ✅ SÍ
- **Ejemplo**: 1,230764

### **Campo 3: Longitud** → Columna C
- **Tipo**: Respuesta corta  
- **Pregunta**: "Longitud *"
- **Descripción**: "Formato decimal con coma (ej: -77,267497)"
- **Obligatorio**: ✅ SÍ
- **Ejemplo**: -77,267497

### **Campo 4: Estado** → Columna D
- **Tipo**: Lista desplegable
- **Pregunta**: "Estado del NAP *"
- **Opciones**:
  ```
  Pendiente
  En construcción
  Instalada
  En mantenimiento
  Inactiva
  ```
- **Obligatorio**: ✅ SÍ

### **Campo 5: Registrado Por** → Columna E
- **Tipo**: Respuesta corta
- **Pregunta**: "Registrado Por *"
- **Descripción**: "Nombre del técnico que registra"
- **Obligatorio**: ✅ SÍ
- **Ejemplo**: Richard Ortiz

### **Campo 6: Fecha Registro** → Columna F
- **Tipo**: Fecha
- **Pregunta**: "Fecha de Registro *"
- **Descripción**: "Fecha de instalación o registro"
- **Obligatorio**: ✅ SÍ

### **Campo 7: Validado Por** → Columna G
- **Tipo**: Respuesta corta
- **Pregunta**: "Validado Por"
- **Descripción**: "Nombre del supervisor (opcional)"
- **Obligatorio**: ❌ NO
- **Ejemplo**: Administrador

### **Campo 8: Fecha Validación** → Columna H
- **Tipo**: Fecha
- **Pregunta**: "Fecha de Validación"
- **Descripción**: "Fecha de validación por supervisor (opcional)"
- **Obligatorio**: ❌ NO

### **Campo 9: Comentarios Validación** → Columna I
- **Tipo**: Párrafo
- **Pregunta**: "Comentarios de Validación"
- **Descripción**: "Observaciones del supervisor (opcional)"
- **Obligatorio**: ❌ NO
- **Ejemplo**: Nap Conectorizada

### **Campo 10: Observaciones** → Columna J
- **Tipo**: Párrafo
- **Pregunta**: "Observaciones *"
- **Descripción**: "Detalles técnicos, potencias disponibles, etc."
- **Obligatorio**: ✅ SÍ
- **Ejemplo**: 8 potencias libres

### **Campo 11: Fotos** → Columna K
- **Tipo**: Subida de archivos
- **Pregunta**: "Fotos del NAP"
- **Descripción**: "Fotos de la instalación (opcional)"
- **Configuración**:
  - Tipos: Imágenes
  - Máximo: 3 archivos
  - Tamaño: 10MB por archivo
- **Obligatorio**: ❌ NO

### **Campo 12: Municipio** → Columna L
- **Tipo**: Lista desplegable
- **Pregunta**: "Municipio *"
- **Opciones** (basado en tu región):
  ```
  Sandona
  Pasto
  Ipiales
  Túquerres
  Tumaco
  La Unión
  Samaniego
  Linares
  Consacá
  Yacuanquer
  Otro
  ```
- **Obligatorio**: ✅ SÍ

### **Campo 13: Sector** → Columna M
- **Tipo**: Respuesta corta
- **Pregunta**: "Sector *"
- **Descripción**: "Sector, barrio o vereda específica"
- **Obligatorio**: ✅ SÍ
- **Ejemplo**: ingenio

---

## 🔄 Configuración de Integración

### **Conexión con Google Sheets:**
1. **Método**: Conectar a hoja existente
2. **Hoja**: Tu hoja actual de NAPs
3. **Pestaña**: Crear nueva pestaña "Respuestas Forms"
4. **Mapeo**: Automático según orden de campos

### **Mapeo de Columnas:**
```
Forms Campo 1  → Sheet Columna A (ID)
Forms Campo 2  → Sheet Columna B (Latitud)
Forms Campo 3  → Sheet Columna C (Longitud)
Forms Campo 4  → Sheet Columna D (Estado)
Forms Campo 5  → Sheet Columna E (Registrado Por)
Forms Campo 6  → Sheet Columna F (Fecha Registro)
Forms Campo 7  → Sheet Columna G (Validado Por)
Forms Campo 8  → Sheet Columna H (Fecha Validación)
Forms Campo 9  → Sheet Columna I (Comentarios Validación)
Forms Campo 10 → Sheet Columna J (Observaciones)
Forms Campo 11 → Sheet Columna K (Fotos)
Forms Campo 12 → Sheet Columna L (Municipio)
Forms Campo 13 → Sheet Columna M (Sector)
```

---

## 📱 Configuraciones Especiales

### **Formato de Coordenadas:**
- **Importante**: Tu hoja usa **coma** como separador decimal
- **Formato**: 1,230764 (no 1.230764)
- **Validación**: Permitir comas en coordenadas

### **Estados Válidos:**
Basado en tu dato actual:
- Pendiente
- En construcción  
- **Instalada** ← (tu estado actual)
- En mantenimiento
- Inactiva

### **Municipios de Nariño:**
Lista completa para tu región:
- **Sandona** ← (tu municipio actual)
- Pasto
- Ipiales
- Túquerres
- Tumaco
- La Unión
- Samaniego
- Linares
- Consacá
- Yacuanquer

---

## 🚀 Pasos de Implementación Simplificados

### **1. Crear Formulario:**
- Ir a forms.google.com
- Crear formulario con los 13 campos exactos
- Usar el orden y tipos especificados arriba

### **2. Conectar a tu Hoja:**
- Respuestas → Crear hoja de cálculo
- Seleccionar tu hoja existente
- Verificar que las columnas coincidan

### **3. Probar:**
- Llenar formulario de prueba
- Verificar que aparezca en tu hoja
- Confirmar que el sistema web lo detecte

---

## 📋 Ejemplo de Respuesta del Forms

**Datos que llenarían los técnicos:**
```
ID: STBNAP-NC-047
Latitud: 1,234567
Longitud: -77,123456
Estado: Instalada
Registrado Por: Carlos Pérez
Fecha Registro: 15/11/2025
Validado Por: [vacío inicialmente]
Fecha Validación: [vacío inicialmente]  
Comentarios Validación: [vacío inicialmente]
Observaciones: 12 potencias libres, splitter 1x16
Fotos: [archivo imagen]
Municipio: Pasto
Sector: centro
```

---

## ✅ Ventajas de esta Estructura

1. **Compatibilidad 100%** con tu sistema actual
2. **Sin cambios** en el backend
3. **Mapeo directo** de columnas
4. **Formato consistente** (comas en coordenadas)
5. **Estados válidos** según tu operación
6. **Municipios reales** de tu región

¿Te parece perfecto así? ¿Quieres que creemos el formulario con esta estructura exacta?