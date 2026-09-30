@echo off
echo ============================================
echo   ScholarPath - Scholarship Recommendation
echo ============================================
echo.
echo [1] Starting FastAPI backend server...
echo     URL: http://localhost:8000
echo     API Docs: http://localhost:8000/docs
echo.
echo [2] Frontend will be served automatically.
echo     Open browser at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server.
echo.
cd /d "%~dp0backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
