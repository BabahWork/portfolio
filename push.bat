@echo off
cd /d "%~dp0"
git add -A
git commit -m "update: %date% %time%" -q 2>nul
if errorlevel 1 echo Nothing to commit.
git push -u origin main
echo.
pause
