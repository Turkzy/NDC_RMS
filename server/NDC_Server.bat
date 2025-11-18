@echo off
title RMS Server
echo ========================================
echo   Starting NDC_RMS Server...
echo ========================================
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
npm start

pause

