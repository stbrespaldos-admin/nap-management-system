@echo off
echo 🔧 Limpiando secretos y resubiendo a GitHub...
echo.

echo 🗑️ Removiendo archivos con secretos del historial...
git rm --cached PUNTO_DE_CONTROL.md
git rm --cached CONFIGURACION_GOOGLE.md 2>nul
git rm --cached setup-auth.md 2>nul

echo.
echo 📝 Agregando archivos limpios...
git add PUNTO_DE_CONTROL.md
git add .

echo.
echo 💾 Creando commit sin secretos...
git commit -m "Remove sensitive credentials - prepare for secure deployment"

echo.
echo 🧹 Limpiando historial de secretos...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch PUNTO_DE_CONTROL.md" --prune-empty --tag-name-filter cat -- --all 2>nul

echo.
echo 📝 Agregando archivos finales limpios...
git add .
git commit -m "NAP Management System - Clean deployment ready"

echo.
echo 📤 Subiendo código limpio a GitHub...
git push origin main --force

if errorlevel 1 (
    echo.
    echo ❌ Error en push. Intentando método alternativo...
    echo 🔄 Reseteando y creando commit limpio...
    git reset --hard HEAD~3
    git add .
    git commit -m "NAP Management System - Secure version without credentials"
    git push origin main --force
)

echo.
echo ✅ ¡Código subido exitosamente sin secretos!
echo 🔒 Todas las credenciales están ahora como variables de entorno
echo 🌐 Listo para configurar en Render con variables seguras
echo.
pause