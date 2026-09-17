# GreenRoute AI — Development Setup Script (Windows PowerShell)
# Run from repository root: .\scripts\dev-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "=== GreenRoute AI — Dev Setup ===" -ForegroundColor Cyan

# 1. Environment file
if (-not (Test-Path "$Root\.env")) {
    Copy-Item "$Root\.env.example" "$Root\.env"
    Write-Host "[OK] Created .env from .env.example"
} else {
    Write-Host "[SKIP] .env already exists"
}

# 2. Docker PostgreSQL
Write-Host "`nStarting PostgreSQL (Docker)..." -ForegroundColor Yellow
Push-Location $Root
docker compose up -d
Pop-Location

Write-Host "Waiting for PostgreSQL health check..."
for ($i = 1; $i -le 24; $i++) {
    $status = docker inspect --format='{{.State.Health.Status}}' greenroute-postgres 2>$null
    if ($status -eq 'healthy') { break }
    Start-Sleep -Seconds 2
}
if ($status -ne 'healthy') { throw "PostgreSQL did not become healthy in time" }
Write-Host "[OK] PostgreSQL is healthy on port 5433"

# 3. Backend
Write-Host "`nSetting up backend..." -ForegroundColor Yellow
Push-Location "$Root\backend"
if (-not (Test-Path "node_modules")) { npm install }
$env:DATABASE_URL = "postgresql://greenroute:greenroute_dev_password@localhost:5433/greenroute?schema=public"
npx prisma generate
npx prisma migrate deploy
npm run db:seed
Pop-Location
Write-Host "[OK] Backend dependencies, migrations, and seed complete"

# 4. AI service
Write-Host "`nSetting up AI service..." -ForegroundColor Yellow
Push-Location "$Root\ai-service"
if (-not (Test-Path "venv")) { python -m venv venv }
& .\venv\Scripts\pip install -r requirements.txt
Pop-Location
Write-Host "[OK] AI service virtual environment ready"

# 5. Frontend
Write-Host "`nSetting up frontend..." -ForegroundColor Yellow
Push-Location "$Root\frontend"
if (-not (Test-Path "node_modules")) { npm install }
Pop-Location
Write-Host "[OK] Frontend dependencies ready"

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Start services in separate terminals:"
Write-Host ""
Write-Host "  Terminal 1 - Backend:    cd backend ; npm run dev"
Write-Host "  Terminal 2 - AI Service: cd ai-service ; .\venv\Scripts\uvicorn app.main:app --reload --port 8000"
Write-Host "  Terminal 3 - Frontend:   cd frontend ; npm run dev"
Write-Host ""
Write-Host "URLs:"
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  Backend:   http://localhost:3001/api/v1/health"
Write-Host "  AI Service: http://localhost:8000/health"
Write-Host "  PostgreSQL: localhost:5433"
Write-Host ""
