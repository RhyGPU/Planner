@echo off
setlocal enabledelayedexpansion

REM OmniPlan Development Server Launcher
REM Start the Vite development server

echo.
echo 🚀 Starting OmniPlan Development Server...
echo 📍 Listening on http://localhost:5173
echo.
echo Checking for dependencies...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting dev server...
echo Press Ctrl+C to stop
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error starting server. Check npm output above.
    pause
    exit /b 1
)

pause
