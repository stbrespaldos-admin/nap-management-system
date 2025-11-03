@echo off
echo 🚀 Preparando proyecto NAP Management para deployment...
echo.

echo 📦 Instalando dependencias principales...
call npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias principales
    pause
    exit /b 1
)

echo.
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo 🏗️ Construyendo aplicación React...
call npm run build
if errorlevel 1 (
    echo ❌ Error construyendo aplicación React
    echo 💡 Intentando con --legacy-peer-deps...
    call npm install --legacy-peer-deps
    call npm run build
    if errorlevel 1 (
        echo ❌ Error construyendo aplicación React después del segundo intento
        pause
        exit /b 1
    )
)
cd ..

echo.
echo 📦 Instalando dependencias del backend...
cd backend  
call npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Proyecto preparado exitosamente para deployment!
echo 📋 Archivos listos:
echo    - server.js (servidor unificado)
echo    - package.json (configuración principal)
echo    - frontend/build/ (aplicación React compilada)
echo    - .gitignore (archivos a ignorar)
echo.
echo 🎯 Siguiente paso: Ejecutar deploy-to-github.bat
echo.
pause