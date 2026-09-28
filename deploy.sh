#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "      Commerza Production Deployment Engine               "
echo "=========================================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Ensure .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️ .env.production not found! Initializing from .env.production.example..."
    cp .env.production.example .env.production
    echo "ℹ️ Please review and update credentials in .env.production before going public."
fi

echo "🚀 Building production Docker images..."
docker compose --env-file .env.production -f docker-compose.prod.yml build

echo "📦 Starting containers in detached mode..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

echo "⏳ Waiting for database and services to reach healthy status..."
sleep 10

echo "✅ Running database migrations & schema sync..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push

echo "=========================================================="
echo "🎉 Commerza is now running in production mode!"
echo "   - Storefront & Proxy: http://localhost:80 (or your server IP)"
echo "   - Backend API:        http://localhost:3000/api/v1"
echo "   - Admin Dashboard:    http://localhost:80/admin"
echo "=========================================================="
