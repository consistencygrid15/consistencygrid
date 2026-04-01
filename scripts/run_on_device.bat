@echo off
echo ========================================
echo   ConsistencyGrid Android Builder
echo ========================================

echo.
echo [1/4] Checking for connected devices...
adb devices

echo.
echo [2/4] Building APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Installing APK...
adb install -r app\build\outputs\apk\debug\app-debug.apk

echo.
echo [4/4] Launching App...
adb shell am start -n com.consistencygrid/.MainActivity

cd ..
echo.
echo Done! App should be running on your device.
pause
