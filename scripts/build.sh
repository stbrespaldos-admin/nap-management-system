#!/bin/bash

# Build script for NAP Management System
set -e

echo "🚀 Starting build process..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set environment
ENVIRONMENT=${1:-production}
echo "📦 Building for environment: $ENVIRONMENT"

# Create logs directory if it doesn't exist
mkdir -p logs

# Build images
echo "🔨 Building Docker images..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.dev.yml build --no-cache
else
    docker-compose build --no-cache
fi

echo "✅ Build completed successfully!"

# Show image sizes
echo "📊 Image sizes:"
docker images | grep nap-management