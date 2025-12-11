@echo off
REM Unified startup script for Windows
REM Starts both Flask backend and Vite frontend development servers

echo ============================================================
echo   Egyptian ID OCR - Unified Startup Script (Windows)
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm not found. Please install npm
    pause
    exit /b 1
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Ensure static directories exist
if not exist "static\uploads" mkdir static\uploads
if not exist "static\crops" mkdir static\crops

echo.
echo ============================================================
echo   Starting Servers...
echo ============================================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo ============================================================
echo.

REM Start backend in a new window
start "Flask Backend" cmd /k "python app.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Close those windows or press Ctrl+C in them to stop the servers.
echo.
pause

