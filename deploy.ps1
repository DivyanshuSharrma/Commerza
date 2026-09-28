Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Commerza Production Deployment Engine (Windows)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check Docker CLI
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Error: Docker is not installed or not in PATH."
    exit 1
}

# Ensure .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "⚠️ .env.production not found! Copying from .env.production.example..." -ForegroundColor Yellow
    Copy-Item .env.production.example .env.production
    Write-Host "ℹ️ Please configure .env.production with your production secrets." -ForegroundColor Gray
}

Write-Host "🚀 Building production Docker images..." -ForegroundColor Green
docker compose --env-file .env.production -f docker-compose.prod.yml build

Write-Host "📦 Starting containers in detached mode..." -ForegroundColor Green
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "✅ Syncing Prisma database schema..." -ForegroundColor Green
docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🎉 Commerza is now running in production mode!" -ForegroundColor Green
Write-Host "   - Storefront & Proxy: http://localhost:80" -ForegroundColor White
Write-Host "   - Backend API:        http://localhost:3000/api/v1" -ForegroundColor White
Write-Host "   - Admin Dashboard:    http://localhost:80/admin" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
