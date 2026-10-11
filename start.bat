@echo off
cd /d "%~dp0"
start "TruthLens Backend" cmd /k "cd backend && "C:\Users\negil\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000"
start "TruthLens Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 10 >nul
start http://localhost:5173