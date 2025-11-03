# 🚀 Guía Paso a Paso - Implementación Google Forms

## 📋 PASO 1: Crear el Formulario Base

### 1.1 Acceder a Google Forms
1. Ve a [forms.google.com](https://forms.google.com)
2. Haz clic en **"+ Formulario en blanco"**
3. Cambia el título a: **"📡 Registro de NAP - Sistema de Gestión"**

### 1.2 Configurar Descripción
```
Formulario para el registro de Puntos de Acceso de Red (NAPs) por parte del personal técnico de campo.

⚠️ IMPORTANTE: Todos los campos marcados con * son obligatorios.
📍 Asegúrate de tomar las coordenadas GPS exactas en el sitio de instalación.
```

---

## 📝 PASO 2: Agregar Campos del Formulario

### **Campo 1: ID del NAP**
- **Tipo**: Respuesta corta
- **Pregunta**: "ID único del NAP *"
- **Descripción**: "Formato: STBNAP-XX-### (ej: STBNAP-NC-047)"
- **Obligatorio**: ✅ SÍ
- **Validación**: 
  - Respuesta corta
  - Expresión regular: `STBNAP-[A-Z]{2}-[0-9]{3}`

### **Campo 2: Técnico Responsable**
- **Tipo**: Respuesta corta
- **Pregunta**: "Nombre completo del técnico *"
- **Descripción**: "Técnico que realiza la instalación"
- **Obligatorio**: ✅ SÍ

### **Campo 3: Latitud**
- **Tipo**: Respuesta corta
- **Pregunta**: "Coordenada de Latitud *"
- **Descripción**: "Usar formato decimal (ej: 1.230764). Usar punto como separador decimal."
- **Obligatorio**: ✅ SÍ
- **Validación**: 
  - Número
  - Entre -90 y 90

### **Campo 4: Longitud**
- **Tipo**: Respuesta corta
- **Pregunta**: "Coordenada de Longitud *"
- **Descripción**: "Usar formato decimal (ej: -77.267497). Usar punto como separador decimal."
- **Obligatorio**: ✅ SÍ
- **Validación**: 
  - Número
  - Entre -180 y 180

### **Campo 5: Municipio**
- **Tipo**: Lista desplegable
- **Pregunta**: "Municipio de instalación *"
- **Opciones**:
  ```
  Sandona
  Pasto
  Ipiales
  Túquerres
  Tumaco
  La Unión
  Samaniego
  Linares
  Otro
  ```
- **Obligatorio**: ✅ SÍ

### **Campo 6: Sector/Barrio**
- **Tipo**: Respuesta corta
- **Pregunta**: "Sector o barrio específico *"
- **Descripción**: "Nombre del sector, barrio o vereda"
- **Obligatorio**: ✅ SÍ

### **Campo 7: Estado del NAP**
- **Tipo**: Opción múltiple
- **Pregunta**: "Estado actual del NAP *"
- **Opciones**:
  ```
  🟡 Pendiente
  🔵 En construcción
  🟢 Instalado
  🟠 En mantenimiento
  ```
- **Obligatorio**: ✅ SÍ

### **Campo 8: Fecha de Registro**
- **Tipo**: Fecha
- **Pregunta**: "Fecha de registro/instalación *"
- **Descripción**: "Fecha en que se realiza el registro o instalación"
- **Obligatorio**: ✅ SÍ

### **Campo 9: Observaciones Técnicas**
- **Tipo**: Párrafo
- **Pregunta**: "Observaciones y detalles técnicos *"
- **Descripción**: "Incluir: potencias disponibles, tipo de instalación, equipos utilizados, etc."
- **Obligatorio**: ✅ SÍ

### **Campo 10: Fotos de Instalación**
- **Tipo**: Subida de archivos
- **Pregunta**: "Fotos del NAP instalado (opcional)"
- **Descripción**: "Subir fotos de la instalación para documentación"
- **Configuración**:
  - Tipos permitidos: Imágenes
  - Número máximo de archivos: 5
  - Tamaño máximo: 10 MB por archivo

---

## 🔧 PASO 3: Configurar Lógica Condicional

### **Sección de Validación (Condicional)**

### **Campo 11: ¿Requiere validación?**
- **Tipo**: Opción múltiple
- **Pregunta**: "¿Este NAP requiere validación por supervisor?"
- **Opciones**:
  ```
  Sí, requiere validación
  No, es solo actualización
  ```

### **Campo 12: Validado por** (Condicional)
- **Tipo**: Respuesta corta
- **Pregunta**: "Nombre del supervisor que valida"
- **Mostrar si**: Campo anterior = "Sí, requiere validación"

### **Campo 13: Fecha de Validación** (Condicional)
- **Tipo**: Fecha
- **Pregunta**: "Fecha de validación"
- **Mostrar si**: Campo 12 tiene respuesta

### **Campo 14: Comentarios de Validación** (Condicional)
- **Tipo**: Párrafo
- **Pregunta**: "Comentarios del supervisor"
- **Mostrar si**: Campo 12 tiene respuesta

---

## ⚙️ PASO 4: Configuraciones del Formulario

### 4.1 Configuraciones Generales
1. Haz clic en **⚙️ Configuración** (arriba derecha)
2. **General**:
   - ✅ Recopilar direcciones de correo electrónico
   - ✅ Limitar a 1 respuesta
   - ✅ Los encuestados pueden editar la respuesta después del envío

3. **Presentación**:
   - ✅ Mostrar barra de progreso
   - ✅ Orden aleatorio de preguntas: **NO**
   - ✅ Mostrar enlace para enviar otra respuesta

---

## 🔗 PASO 5: Conectar con Google Sheets

### 5.1 Crear Conexión
1. En el formulario, haz clic en **"Respuestas"** (arriba)
2. Haz clic en el ícono de **Google Sheets** (hoja de cálculo verde)
3. Selecciona **"Seleccionar hoja de cálculo existente"**
4. Busca y selecciona tu hoja de NAPs actual
5. Haz clic en **"Crear"**

### 5.2 Verificar Mapeo de Columnas
Google Forms creará automáticamente una nueva pestaña llamada **"Respuestas del formulario"**. 

**Columnas que se crearán automáticamente:**
```
A: Marca temporal
B: Dirección de correo electrónico  
C: ID único del NAP
D: Nombre completo del técnico
E: Coordenada de Latitud
F: Coordenada de Longitud
G: Municipio de instalación
H: Sector o barrio específico
I: Estado actual del NAP
J: Fecha de registro/instalación
K: Observaciones y detalles técnicos
L: Fotos del NAP instalado
M: ¿Este NAP requiere validación por supervisor?
N: Nombre del supervisor que valida
O: Fecha de validación
P: Comentarios del supervisor
```

---

## 🔄 PASO 6: Integrar con Sistema Actual

### 6.1 Modificar Backend para Leer Ambas Hojas
Necesitamos actualizar el backend para que lea tanto la hoja original como las respuestas del formulario.

### 6.2 Script de Sincronización (Opcional)
Crear un script que copie datos de "Respuestas del formulario" a la hoja principal con el formato correcto.

---

## 📱 PASO 7: Optimizar para Móviles

### 7.1 Configurar Tema
1. Haz clic en **🎨 Personalizar tema** (arriba derecha)
2. Selecciona un tema profesional
3. Cambia color principal a azul corporativo
4. Agregar logo de la empresa (opcional)

### 7.2 Vista Previa Móvil
1. Haz clic en **👁️ Vista previa** (arriba derecha)
2. Selecciona **📱 Móvil** para verificar diseño
3. Ajustar si es necesario

---

## 🚀 PASO 8: Distribuir el Formulario

### 8.1 Obtener Enlaces
1. Haz clic en **"Enviar"** (arriba derecha)
2. Selecciona **🔗 Enlace**
3. ✅ Acortar URL
4. Copiar enlace

### 8.2 Crear QR Code
1. Ve a [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Pega el enlace del formulario
3. Genera QR code
4. Descarga e imprime para técnicos

### 8.3 Compartir con Equipo
- **WhatsApp**: Enviar enlace directo
- **Email**: Enviar con instrucciones
- **Impreso**: QR code en tarjetas

---

## 📊 PASO 9: Configurar Notificaciones

### 9.1 Notificaciones por Email
1. En **"Respuestas"**, haz clic en **⋮ Más**
2. Selecciona **"Recibir notificaciones por correo electrónico para nuevas respuestas"**
3. Confirmar activación

### 9.2 Notificaciones Avanzadas (Opcional)
Usar Google Apps Script para notificaciones personalizadas:
```javascript
function onFormSubmit(e) {
  // Enviar email personalizado
  // Actualizar sistema externo
  // Crear notificación Slack/Teams
}
```

---

## 🔧 PASO 10: Pruebas y Validación

### 10.1 Prueba Completa
1. **Llenar formulario** con datos de prueba
2. **Verificar** que aparezca en Google Sheets
3. **Confirmar** que el sistema web lo detecte
4. **Validar** que aparezca en el mapa

### 10.2 Prueba con Técnicos
1. Compartir con 1-2 técnicos de confianza
2. Pedir feedback sobre usabilidad
3. Ajustar campos si es necesario
4. Capacitar al equipo completo

---

## 📋 CHECKLIST FINAL

- [ ] Formulario creado con todos los campos
- [ ] Validaciones configuradas correctamente
- [ ] Conectado a Google Sheets existente
- [ ] Lógica condicional funcionando
- [ ] Optimizado para móviles
- [ ] Enlaces y QR codes generados
- [ ] Notificaciones configuradas
- [ ] Pruebas completadas exitosamente
- [ ] Equipo técnico capacitado
- [ ] Sistema integrado funcionando

---

## 🎯 Resultado Final

**Flujo Completo:**
```
Técnico en Campo
       ↓
📱 Llena Google Forms
       ↓
📊 Datos → Google Sheets (automático)
       ↓
🖥️ Sistema Web lee datos (tiempo real)
       ↓
🗺️ NAP aparece en mapa (inmediato)
       ↓
✅ Supervisor valida (opcional)
```

**¡Tu sistema estará completamente automatizado desde el campo hasta el dashboard!**

---

¿Quieres que empecemos a crear el formulario paso a paso, o prefieres algún ajuste en esta guía?