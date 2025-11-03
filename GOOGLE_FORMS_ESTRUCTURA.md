# 📋 Estructura Google Forms - Registro de NAPs

## 🎯 Objetivo
Formulario para que técnicos de campo registren nuevos NAPs que se integren automáticamente con el sistema.

## 📝 Estructura del Formulario

### **Título del Formulario:**
`📡 Registro de NAP - Sistema de Gestión`

### **Descripción:**
```
Formulario para el registro de Puntos de Acceso de Red (NAPs) por parte del personal técnico de campo.

⚠️ IMPORTANTE: Todos los campos marcados con * son obligatorios.
📍 Asegúrate de tomar las coordenadas GPS exactas en el sitio de instalación.
```

---

## 🔧 Campos del Formulario

### **1. INFORMACIÓN BÁSICA**

#### **1.1 ID del NAP*** (Texto corto)
- **Pregunta**: "ID único del NAP"
- **Descripción**: "Formato: STBNAP-XX-### (ej: STBNAP-NC-047)"
- **Validación**: Texto obligatorio
- **Ejemplo**: STBNAP-NC-047

#### **1.2 Técnico Responsable*** (Texto corto)
- **Pregunta**: "Nombre completo del técnico"
- **Descripción**: "Técnico que realiza la instalación"
- **Validación**: Texto obligatorio
- **Ejemplo**: Richard Ortiz

---

### **2. UBICACIÓN GEOGRÁFICA**

#### **2.1 Latitud*** (Texto corto)
- **Pregunta**: "Coordenada de Latitud"
- **Descripción**: "Usar formato decimal (ej: 1.230764). Usar punto como separador decimal."
- **Validación**: Número decimal obligatorio
- **Ejemplo**: 1.230764

#### **2.2 Longitud*** (Texto corto)
- **Pregunta**: "Coordenada de Longitud"
- **Descripción**: "Usar formato decimal (ej: -77.267497). Usar punto como separador decimal."
- **Validación**: Número decimal obligatorio
- **Ejemplo**: -77.267497

#### **2.3 Municipio*** (Lista desplegable)
- **Pregunta**: "Municipio de instalación"
- **Opciones**:
  - Sandona
  - Pasto
  - Ipiales
  - Túquerres
  - Tumaco
  - La Unión
  - Otro (especificar)

#### **2.4 Sector/Barrio*** (Texto corto)
- **Pregunta**: "Sector o barrio específico"
- **Descripción**: "Nombre del sector, barrio o vereda"
- **Ejemplo**: ingenio, centro, norte

---

### **3. ESTADO Y FECHAS**

#### **3.1 Estado del NAP*** (Opción múltiple)
- **Pregunta**: "Estado actual del NAP"
- **Opciones**:
  - 🟡 Pendiente (Planificado pero no instalado)
  - 🔵 En construcción (En proceso de instalación)
  - 🟢 Instalado (Completamente funcional)
  - 🟠 En mantenimiento (Requiere intervención)

#### **3.2 Fecha de Registro*** (Fecha)
- **Pregunta**: "Fecha de registro/instalación"
- **Descripción**: "Fecha en que se realiza el registro o instalación"
- **Validación**: Fecha obligatoria

---

### **4. INFORMACIÓN TÉCNICA**

#### **4.1 Observaciones Técnicas*** (Párrafo)
- **Pregunta**: "Observaciones y detalles técnicos"
- **Descripción**: "Incluir: potencias disponibles, tipo de instalación, equipos utilizados, etc."
- **Ejemplo**: "8 potencias libres, instalación en poste de concreto, splitter 1x8"

#### **4.2 Fotos de Instalación** (Subida de archivos)
- **Pregunta**: "Fotos del NAP instalado (opcional)"
- **Descripción**: "Subir fotos de la instalación para documentación"
- **Tipos permitidos**: JPG, PNG
- **Máximo**: 5 archivos

---

### **5. VALIDACIÓN (Solo para Supervisores)**

#### **5.1 ¿Requiere validación?** (Sí/No)
- **Pregunta**: "¿Este NAP requiere validación por supervisor?"
- **Descripción**: "Marcar SÍ si es una instalación nueva que requiere aprobación"

#### **5.2 Validado por** (Texto corto - Condicional)
- **Pregunta**: "Nombre del supervisor que valida"
- **Mostrar solo si**: Respuesta anterior es "Sí"
- **Ejemplo**: Administrador

#### **5.3 Fecha de Validación** (Fecha - Condicional)
- **Pregunta**: "Fecha de validación"
- **Mostrar solo si**: Se completó campo anterior

#### **5.4 Comentarios de Validación** (Párrafo - Condicional)
- **Pregunta**: "Comentarios del supervisor"
- **Mostrar solo si**: Se completó validador
- **Ejemplo**: "Validado correctamente, cumple especificaciones técnicas"

---

## ⚙️ Configuración del Formulario

### **Configuraciones Generales:**
- ✅ Recopilar direcciones de correo electrónico
- ✅ Limitar a 1 respuesta por persona
- ✅ Permitir editar respuesta después del envío
- ✅ Mostrar barra de progreso
- ✅ Orden aleatorio de preguntas: NO

### **Configuración de Respuestas:**
- ✅ Enviar copia de respuestas al usuario
- ✅ Mostrar resumen de respuestas después del envío
- ✅ Permitir ver respuestas públicas: NO

---

## 🔗 Integración con Google Sheets

### **Configuración de Destino:**
1. **Conectar a hoja existente**: Tu hoja actual de NAPs
2. **Nueva pestaña**: "Respuestas Formulario" 
3. **Mapeo de columnas**:

| Campo Formulario | Columna Sheet | Posición |
|------------------|---------------|----------|
| ID del NAP | A | ID |
| Latitud | B | Latitud |
| Longitud | C | Longitud |
| Estado del NAP | D | Estado |
| Técnico Responsable | E | Registrado Por |
| Fecha de Registro | F | Fecha Registro |
| Validado por | G | Validado Por |
| Fecha de Validación | H | Fecha Validación |
| Comentarios de Validación | I | Comentarios Validación |
| Observaciones Técnicas | J | Observaciones |
| Fotos | K | Fotos |
| Municipio | L | Municipio |
| Sector/Barrio | M | Sector |

---

## 📱 Configuración para Móviles

### **Optimizaciones:**
- ✅ Formulario responsive para tablets/móviles
- ✅ Campos de coordenadas con validación numérica
- ✅ Lista desplegable para municipios (evita errores de escritura)
- ✅ Campos condicionales para reducir complejidad
- ✅ Subida de fotos desde cámara del dispositivo

---

## 🚀 Pasos para Implementar

### **1. Crear el Formulario:**
1. Ve a [forms.google.com](https://forms.google.com)
2. Crear formulario en blanco
3. Agregar campos según estructura anterior
4. Configurar validaciones y lógica condicional

### **2. Conectar con Sheets:**
1. En el formulario: Respuestas → Crear hoja de cálculo
2. Seleccionar hoja existente de NAPs
3. Verificar mapeo de columnas

### **3. Configurar Notificaciones:**
1. Configurar notificación por email al recibir respuestas
2. Opcional: Webhook para actualización automática del sistema

### **4. Distribuir a Técnicos:**
1. Obtener enlace del formulario
2. Crear QR code para acceso rápido
3. Compartir con equipo técnico

---

## 📊 Flujo de Trabajo Completo

```
Técnico en Campo
       ↓
Llena Google Forms
       ↓
Datos → Google Sheets
       ↓
Sistema Web lee automáticamente
       ↓
NAP aparece en mapa
       ↓
Supervisor valida (opcional)
       ↓
Estado actualizado en sistema
```

---

## 🔧 Validaciones Recomendadas

### **Coordenadas GPS:**
- Latitud: Entre -90 y 90
- Longitud: Entre -180 y 180
- Formato decimal obligatorio

### **ID NAP:**
- Patrón: STBNAP-XX-###
- Único (no duplicados)

### **Fechas:**
- No futuras para fecha de registro
- Fecha validación posterior a registro

---

¿Te parece bien esta estructura? ¿Quieres que ajuste algún campo o agreguemos algo específico para tu operación?