@echo off
title NDC_CSG Server
echo ========================================
echo   Starting NDC_CSG Server...
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

