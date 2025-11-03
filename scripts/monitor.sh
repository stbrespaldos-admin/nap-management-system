#!/bin/bash

# Monitoring script for NAP Management System
set -e

ENVIRONMENT=${1:-production}

echo "📊 NAP Management System - Health Monitor"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date)"
echo "=================================="

# Set URLs based on environment
if [ "$ENVIRONMENT" = "development" ]; then
    FRONTEND_URL="http://localhost:3000"
    BACKEND_URL="http://localhost:5000"
else
    FRONTEND_URL="http://localhost"
    BACKEND_URL="http://localhost:5000"
fi

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local endpoint=$3
    
    echo -n "🔍 Checking $service_name... "
    
    if curl -f -s "$url$endpoint" > /dev/null; then
        echo "✅ Healthy"
        return 0
    else
        echo "❌ Unhealthy"
        return 1
    fi
}

# Function to get service metrics
get_metrics() {
    local service_name=$1
    
    echo "📈 $service_name Metrics:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep "$service_name" || echo "  No metrics available"
}

# Check Docker containers
echo "🐳 Docker Container Status:"
docker-compose ps

echo ""

# Check service health
BACKEND_HEALTHY=0
FRONTEND_HEALTHY=0

check_service "Backend API" "$BACKEND_URL" "/api/health" && BACKEND_HEALTHY=1
check_service "Frontend" "$FRONTEND_URL" "/health" && FRONTEND_HEALTHY=1

echo ""

# Get container metrics
get_metrics "backend"
get_metrics "frontend"

echo ""

# Check disk space
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""

# Check logs for errors (last 10 lines)
echo "📋 Recent Backend Logs:"
docker-compose logs --tail=10 backend 2>/dev/null || echo "  No logs available"

echo ""
echo "📋 Recent Frontend Logs:"
docker-compose logs --tail=10 frontend 2>/dev/null || echo "  No logs available"

echo ""

# Overall health status
if [ $BACKEND_HEALTHY -eq 1 ] && [ $FRONTEND_HEALTHY -eq 1 ]; then
    echo "🎉 System Status: HEALTHY"
    exit 0
else
    echo "⚠️  System Status: UNHEALTHY"
    exit 1
fi