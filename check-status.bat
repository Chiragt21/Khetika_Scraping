@echo off
echo ========================================
echo    Dashboard Status Check
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
) else (
    echo ❌ Node.js is not installed
    goto :end
)

echo.
echo Checking npm packages...
if exist node_modules (
    echo ✅ Dependencies are installed
) else (
    echo ❌ Dependencies are missing. Run: npm install
    goto :end
)

echo.
echo Checking Next.js server...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Dashboard server is running on port 3000
    echo    Main dashboard: http://localhost:3000
    echo    Test page: http://localhost:3000/test
) else (
    echo ❌ Dashboard server is not running
    echo    Start it with: npm run dev
)

echo.
echo Checking Supabase connection...
echo ⚠️  Supabase connection needs to be tested in the dashboard

echo.
echo ========================================
echo    Status Check Complete
echo ========================================

:end
pause 