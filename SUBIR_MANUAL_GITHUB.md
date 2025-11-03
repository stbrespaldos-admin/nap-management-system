# 📤 Subir Manualmente a GitHub (Sin Git)

## 🎯 Opción Manual - Subir por Web

### **Paso 1: Crear Repositorio**
1. Ve a https://github.com/new
2. Nombre: `nap-management-system`
3. Descripción: `Sistema de Gestión de NAPs con Google Sheets`
4. **Público** o **Privado** (tu elección)
5. **NO** inicializar con README, .gitignore o licencia
6. Clic en **"Create repository"**

### **Paso 2: Preparar Archivos**
Crear un ZIP con estos archivos (EXCLUIR las carpetas node_modules):

**✅ Incluir:**
```
📁 Raíz del proyecto/
├── 📄 server.js
├── 📄 package.json
├── 📄 .gitignore
├── 📄 render.yaml
├── 📄 README_DEPLOYMENT.md
├── 📁 frontend/
│   ├── 📁 src/
│   ├── 📁 public/
│   ├── 📁 build/
│   ├── 📄 package.json
│   └── 📄 .eslintrc.json
├── 📁 backend/
│   ├── 📁 src/
│   ├── 📄 package.json
│   └── 📄 server-sheets.js
└── 📁 .kiro/
```

**❌ EXCLUIR:**
```
❌ node_modules/ (en todas las carpetas)
❌ .env (archivos sensibles)
❌ backend/config/google-service-account.json
❌ *.log
❌ .DS_Store
```

### **Paso 3: Subir por Web**
1. En tu repositorio GitHub, clic **"uploading an existing file"**
2. Arrastra todos los archivos/carpetas (excepto los excluidos)
3. Commit message: `Initial commit: NAP Management System ready for deployment`
4. Clic **"Commit changes"**

---

## 🚀 Opción Recomendada - Instalar Git

### **Descarga e Instalación:**
1. **Descargar**: https://git-scm.com/download/win
2. **Ejecutar** el instalador
3. **Configuración recomendada**:
   - ✅ Use Git from the command line and also from 3rd-party software
   - ✅ Use the OpenSSL library
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use Windows' default console window

### **Después de Instalar Git:**
```bash
# Verificar instalación
git --version

# Ejecutar el script
.\deploy-to-github.bat
```

---

## 📋 Comandos Git Manuales (Después de Instalar)

Si prefieres hacerlo paso a paso:

```bash
# 1. Inicializar repositorio
git init

# 2. Configurar usuario (primera vez)
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# 3. Agregar archivos
git add .

# 4. Crear commit
git commit -m "Initial commit: NAP Management System ready for deployment"

# 5. Conectar con GitHub
git remote add origin https://github.com/tuusuario/nap-management-system.git

# 6. Subir código
git branch -M main
git push -u origin main
```

---

## ⏰ Tiempo Estimado

- **Instalar Git**: 5 minutos
- **Subir con script**: 2 minutos
- **Subir manual por web**: 10 minutos

**Recomendación**: Instala Git - te será útil para futuras actualizaciones automáticas.