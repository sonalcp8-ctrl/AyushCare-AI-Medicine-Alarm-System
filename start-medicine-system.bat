@echo off
title आयुष केयर - AI Medicine Alarm & Caretaker System
echo ===================================================================
echo     AYUSHCARE (आयुष केयर) - AI MEDICINE ALARM MANAGEMENT SYSTEM
echo     Specially designed for Elderly Care & Caretakers (MERN Stack)
echo ===================================================================
echo.
echo 1. Starting Node.js + Express Backend on http://localhost:5000...
start "AyushCare Backend (Port 5000)" cmd /k "cd /d %~dp0server && node server.js"

echo 2. Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo 3. Starting React Frontend on http://localhost:5174...
start "AyushCare Frontend (Port 5174)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ===================================================================
echo   System launched successfully!
echo   Frontend: http://localhost:5174
echo   Backend:  http://localhost:5000/api
echo   MongoDB:  mongodb://127.0.0.1:27017/medicine_alarm_db
echo ===================================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5174
pause
