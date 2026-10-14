# PulseZero Quick Launcher
Write-Host "Launching PulseZero War-Room..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:5173"
Write-Host "PulseZero is active at http://127.0.0.1:5173" -ForegroundColor Green
