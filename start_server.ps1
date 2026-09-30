# ============================================================
#  ScholarPath — Start Server (PowerShell)
#  Usage: Right-click > "Run with PowerShell"
#         OR in terminal: .\start_server.ps1
# ============================================================

$BackendDir = Join-Path $PSScriptRoot "backend"
$PythonCmds = @("python", "python3", "py")
$Python = $null

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host "   🎓  ScholarPath — Starting Server       " -ForegroundColor Cyan
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""

# Find Python
foreach ($cmd in $PythonCmds) {
    try {
        $ver = & $cmd --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Python = $cmd
            Write-Host "  ✅ Found Python: $ver ($cmd)" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $Python) {
    Write-Host "  ❌ Python not found. Please install Python 3.9+ from https://python.org" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

# Check pip and install requirements
Write-Host ""
Write-Host "  📦 Checking dependencies..." -ForegroundColor Yellow

$ReqFile = Join-Path $BackendDir "requirements.txt"
if (Test-Path $ReqFile) {
    & $Python -m pip install -r $ReqFile -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠️  Some packages may not have installed. Continuing anyway..." -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Dependencies OK" -ForegroundColor Green
    }
}

# Start uvicorn
Write-Host ""
Write-Host "  🚀 Starting FastAPI server..." -ForegroundColor Green
Write-Host "  📍 URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  📊 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""

# Open browser after 2 seconds in background
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
} | Out-Null

# Run the server
Set-Location $BackendDir
& $Python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# If it exits
Write-Host ""
Write-Host "  Server stopped." -ForegroundColor Yellow
Read-Host "  Press Enter to exit"
