@echo off
title AyushCare - Install Dependencies
echo ===================================================================
echo     AYUSHCARE - INSTALLING DEPENDENCIES (MERN STACK)
echo ===================================================================
echo.
echo 1. Installing Server dependencies...
cd /d "%~dp0server"
call npm install

echo.
echo 2. Installing Client dependencies...
cd /d "%~dp0client"
call npm install

echo.
echo ===================================================================
echo   All dependencies installed successfully!
echo   You can now run 'start-medicine-system.bat' to launch the app.
echo ===================================================================
echo.
pause
