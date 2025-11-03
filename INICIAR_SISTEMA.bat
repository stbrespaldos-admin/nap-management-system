@echo off
echo 🚀 Iniciando Sistema NAP Management...
echo.
echo 📊 Iniciando Backend...
start "Backend NAP" cmd /k "cd backend && node server-sheets.js"
timeout /t 3
echo.
echo 🖥️ Iniciando Frontend...
start "Frontend NAP" cmd /k "cd frontend && npm start"
echo.
echo ✅ Sistema iniciado!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000/health
echo.
pause