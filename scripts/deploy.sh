#!/bin/bash

# Deployment script for NAP Management System
set -e

ENVIRONMENT=${1:-production}
BACKUP=${2:-true}

echo "🚀 Starting deployment process for $ENVIRONMENT environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.production template."
    exit 1
fi

# Backup current deployment if requested
if [ "$BACKUP" = "true" ]; then
    echo "💾 Creating backup..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup logs
    if [ -d "logs" ]; then
        cp -r logs "$BACKUP_DIR/"
    fi
    
    echo "✅ Backup created at $BACKUP_DIR"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.dev.yml down
else
    docker-compose down
fi

# Pull latest images (if using registry)
echo "📥 Pulling latest images..."
# docker-compose pull

# Start services
echo "🔄 Starting services..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.dev.yml up -d
else
    docker-compose up -d
fi

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if [ "$ENVIRONMENT" = "development" ]; then
    FRONTEND_URL="http://localhost:3000"
    BACKEND_URL="http://localhost:5000"
else
    FRONTEND_URL="http://localhost"
    BACKEND_URL="http://localhost:5000"
fi

# Check backend health
if curl -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
if curl -f "$FRONTEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend: $BACKEND_URL"

# Show running containers
echo "📋 Running containers:"
docker-compose ps