@echo off
REM ============================================================================
REM ConsistencyGrid Pre-Launch Verification Script (Windows)
REM ============================================================================
REM This script performs comprehensive checks before launching to production
REM Run this 1 hour before launch to verify all systems are ready
REM ============================================================================

setlocal enabledelayedexpansion
color 0A

REM Colors using ANSI escape codes (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Counters
set "PASSED=0"
set "FAILED=0"
set "WARNINGS=0"

echo.
echo ============================================================================
echo  ConsistencyGrid Pre-Launch Verification
echo ============================================================================
echo.

REM ============================================================================
REM 1. NODE AND NPM CHECK
REM ============================================================================
echo [*] Checking Node.js and NPM...
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[X] FAIL: Node.js not installed or not in PATH%RESET%
    set /a FAILED+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %GREEN%[OK] Node.js installed: !NODE_VERSION!%RESET%
    set /a PASSED+=1
)

call npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[X] FAIL: NPM not installed%RESET%
    set /a FAILED+=1
) else (
    for /f "tokens=*" %%i in ('call npm --version') do set NPM_VERSION=%%i
    echo %GREEN%[OK] NPM installed: !NPM_VERSION!%RESET%
    set /a PASSED+=1
)

REM ============================================================================
REM 2. PROJECT DEPENDENCIES
REM ============================================================================
echo.
echo [*] Checking project dependencies...
if exist "node_modules" (
    echo %GREEN%[OK] node_modules directory exists%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: node_modules not found, run: npm install%RESET%
    set /a WARNINGS+=1
)

REM Check critical packages
for %%P in (next prisma next-auth razorpay) do (
    if exist "node_modules\%%P" (
        echo %GREEN%[OK] Package found: %%P%RESET%
        set /a PASSED+=1
    ) else (
        echo %RED%[X] FAIL: Missing package: %%P%RESET%
        set /a FAILED+=1
    )
)

REM ============================================================================
REM 3. ENVIRONMENT VARIABLES
REM ============================================================================
echo.
echo [*] Checking environment variables...

if defined NEXTAUTH_SECRET (
    echo %GREEN%[OK] NEXTAUTH_SECRET is set%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: NEXTAUTH_SECRET not set%RESET%
    set /a WARNINGS+=1
)

if defined DATABASE_URL (
    echo %GREEN%[OK] DATABASE_URL is set%RESET%
    set /a PASSED+=1
) else (
    echo %RED%[X] FAIL: DATABASE_URL not set%RESET%
    set /a FAILED+=1
)

if defined RAZORPAY_KEY_ID (
    echo %GREEN%[OK] RAZORPAY_KEY_ID is set%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: RAZORPAY_KEY_ID not set%RESET%
    set /a WARNINGS+=1
)

if defined RAZORPAY_KEY_SECRET (
    echo %GREEN%[OK] RAZORPAY_KEY_SECRET is set%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: RAZORPAY_KEY_SECRET not set%RESET%
    set /a WARNINGS+=1
)

if defined NEXT_PUBLIC_SENTRY_DSN (
    echo %GREEN%[OK] NEXT_PUBLIC_SENTRY_DSN is set%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: NEXT_PUBLIC_SENTRY_DSN not set%RESET%
    set /a WARNINGS+=1
)

REM ============================================================================
REM 4. CRITICAL FILES CHECK
REM ============================================================================
echo.
echo [*] Checking critical files...

for %%F in (
    "package.json"
    "next.config.mjs"
    "middleware.js"
    "prisma\schema.prisma"
    ".env.production.example"
    "src\app\api\payment\webhook\route.js"
) do (
    if exist "%%F" (
        echo %GREEN%[OK] Found: %%F%RESET%
        set /a PASSED+=1
    ) else (
        echo %RED%[X] FAIL: Missing: %%F%RESET%
        set /a FAILED+=1
    )
)

REM ============================================================================
REM 5. GIT STATUS
REM ============================================================================
echo.
echo [*] Checking Git status...

git status >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[!] WARNING: Not a Git repository%RESET%
    set /a WARNINGS+=1
) else (
    git diff --quiet
    if errorlevel 1 (
        echo %YELLOW%[!] WARNING: Uncommitted changes found%RESET%
        echo        Run: git status
        set /a WARNINGS+=1
    ) else (
        echo %GREEN%[OK] Working directory clean%RESET%
        set /a PASSED+=1
    )
)

REM ============================================================================
REM 6. SECURITY CHECKS
REM ============================================================================
echo.
echo [*] Checking security configuration...

REM Check rate-limit.js exists
if exist "src\lib\rate-limit.js" (
    echo %GREEN%[OK] Rate limiting module found%RESET%
    set /a PASSED+=1
) else (
    echo %RED%[X] FAIL: Rate limiting module missing%RESET%
    set /a FAILED+=1
)

REM Check validation.js exists
if exist "src\lib\validation.js" (
    echo %GREEN%[OK] Validation module found%RESET%
    set /a PASSED+=1
) else (
    echo %RED%[X] FAIL: Validation module missing%RESET%
    set /a FAILED+=1
)

REM Check payment security
if exist "src\lib\payment" (
    echo %GREEN%[OK] Payment security modules found%RESET%
    set /a PASSED+=1
) else (
    echo %YELLOW%[!] WARNING: Payment modules directory not found%RESET%
    set /a WARNINGS+=1
)

REM ============================================================================
REM 7. BUILD TEST
REM ============================================================================
echo.
echo [*] Testing build...
echo     This may take 1-2 minutes...

call npm run build >nul 2>&1
if errorlevel 1 (
    echo %RED%[X] FAIL: Build failed%RESET%
    echo        Run: npm run build
    set /a FAILED+=1
) else (
    echo %GREEN%[OK] Build successful%RESET%
    set /a PASSED+=1
)

REM ============================================================================
REM SUMMARY
REM ============================================================================
echo.
echo ============================================================================
echo  VERIFICATION SUMMARY
echo ============================================================================
echo %GREEN%  PASSED:  !PASSED!%RESET%
echo %RED%  FAILED:  !FAILED!%RESET%
echo %YELLOW%  WARNINGS: !WARNINGS!%RESET%
echo ============================================================================

if %FAILED% gtr 0 (
    echo.
    echo %RED%[!] DEPLOYMENT BLOCKED - Fix FAILED items above%RESET%
    echo.
    exit /b 1
) else if %WARNINGS% gtr 0 (
    echo.
    echo %YELLOW%[!] DEPLOYMENT OK - But review WARNINGS above%RESET%
    echo.
    exit /b 0
) else (
    echo.
    echo %GREEN%[OK] ALL CHECKS PASSED - READY FOR DEPLOYMENT%RESET%
    echo.
    exit /b 0
)
