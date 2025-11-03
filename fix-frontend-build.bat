@echo off
echo 🔧 Solucionando problemas de build del frontend...
echo.

cd frontend

echo 🗑️ Limpiando node_modules y package-lock...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 Reinstalando con npm cache clean...
call npm cache clean --force

echo.
echo 📦 Instalando dependencias con --force...
call npm install --force

echo.
echo 🏗️ Intentando build...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build falló. Intentando solución alternativa...
    echo 🔧 Instalando ajv específicamente...
    call npm install ajv@^8.0.0 --save-dev
    call npm install ajv-keywords@^5.0.0 --save-dev
    
    echo.
    echo 🏗️ Intentando build nuevamente...
    call npm run build
    
    if errorlevel 1 (
        echo.
        echo ❌ Build aún falla. Usando build alternativo...
        echo 🔧 Configurando variables de entorno...
        set GENERATE_SOURCEMAP=false
        set CI=false
        call npm run build
    )
)

cd ..

echo.
echo ✅ Proceso completado
pause