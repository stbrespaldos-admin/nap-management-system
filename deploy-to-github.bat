@echo off
echo 🚀 Subiendo Sistema NAP Management a GitHub...
echo.

echo 📋 Verificando si Git está instalado...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado. Por favor instala Git primero.
    echo 🔗 Descarga Git desde: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git encontrado
echo.

echo 📝 Inicializando repositorio Git...
git init
if errorlevel 1 (
    echo ❌ Error inicializando Git
    pause
    exit /b 1
)

echo.
echo 📝 Configurando Git (si es necesario)...
git config user.name >nul 2>&1
if errorlevel 1 (
    set /p GIT_NAME="Ingresa tu nombre para Git: "
    git config user.name "!GIT_NAME!"
)

git config user.email >nul 2>&1
if errorlevel 1 (
    set /p GIT_EMAIL="Ingresa tu email para Git: "
    git config user.email "!GIT_EMAIL!"
)

echo.
echo 📝 Agregando archivos al repositorio...
git add .
if errorlevel 1 (
    echo ❌ Error agregando archivos
    pause
    exit /b 1
)

echo.
echo 💾 Creando commit inicial...
git commit -m "Initial commit: NAP Management System ready for deployment"
if errorlevel 1 (
    echo ❌ Error creando commit
    pause
    exit /b 1
)

echo.
echo 🔗 Conectando con GitHub...
echo.
echo 📋 INSTRUCCIONES:
echo 1. Ve a https://github.com/new
echo 2. Crea un repositorio llamado 'nap-management-system'
echo 3. NO inicialices con README, .gitignore o licencia
echo 4. Copia la URL del repositorio (ejemplo: https://github.com/tuusuario/nap-management-system.git)
echo.
set /p REPO_URL="Pega aquí la URL de tu repositorio GitHub: "

if "%REPO_URL%"=="" (
    echo ❌ URL del repositorio requerida
    pause
    exit /b 1
)

echo.
echo 🔗 Agregando remote origin...
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo ❌ Error agregando remote origin
    pause
    exit /b 1
)

echo.
echo 📤 Subiendo código a GitHub...
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo ❌ Error subiendo código. Verifica tu autenticación con GitHub.
    echo 💡 Tip: Puede que necesites configurar un Personal Access Token
    pause
    exit /b 1
)

echo.
echo ✅ ¡Código subido exitosamente a GitHub!
echo.
echo 🎯 SIGUIENTE PASO - CONFIGURAR RENDER:
echo 1. Ve a https://render.com
echo 2. Conecta tu cuenta de GitHub
echo 3. Selecciona el repositorio: nap-management-system
echo 4. Configura las variables de entorno (ver DEPLOYMENT_RENDER_AUTOMATICO.md)
echo 5. ¡Deploy automático!
echo.
echo 🌐 Tu sistema estará disponible en: https://nap-management-system.onrender.com
echo.
pause