# Deployment Guide - Sistema de Gestión de NAPs

## Overview

This guide covers the deployment process for the NAP Management System using Docker containers with support for both development and production environments.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- SSL certificates (for HTTPS deployment)
- Google Cloud Platform account with APIs enabled

## Environment Setup

### 1. Environment Variables

Copy the environment template files and configure them:

```bash
# Root environment (for Docker Compose)
cp .env.production .env

# Frontend environment
cp frontend/.env.production frontend/.env.local
```

### Required Environment Variables

#### Backend (.env)
```bash
# Google APIs
GOOGLE_MAPS_API_KEY=your_production_maps_api_key
GOOGLE_SHEETS_API_KEY=your_production_sheets_api_key
GOOGLE_OAUTH_CLIENT_ID=your_production_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_production_oauth_client_secret

# Application
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
SPREADSHEET_ID=your_google_sheets_spreadsheet_id
NODE_ENV=production
PORT=5000

# CORS
CORS_ORIGIN=https://your-domain.com

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
```bash
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_maps_api_key
REACT_APP_ENVIRONMENT=production
```

## Deployment Options

### Option 1: HTTP Deployment (Development/Testing)

```bash
# Build and start services
npm run docker:build
npm run docker:up

# Or use the deployment script
npm run deploy:prod
```

### Option 2: HTTPS Deployment (Production)

1. **Generate SSL Certificates**
   ```bash
   # For localhost (development)
   bash scripts/setup-ssl.sh localhost
   
   # For production domain
   bash scripts/setup-ssl.sh your-domain.com
   ```

2. **Deploy with SSL**
   ```bash
   docker-compose -f docker-compose.ssl.yml up -d
   ```

### Option 3: Development Environment

```bash
# Start development environment
npm run deploy:dev

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

## Build Scripts

### Available NPM Scripts

```bash
# Docker operations
npm run docker:build          # Build production images
npm run docker:build:dev      # Build development images
npm run docker:up             # Start production containers
npm run docker:up:dev         # Start development containers
npm run docker:down           # Stop production containers
npm run docker:down:dev       # Stop development containers

# Deployment
npm run deploy:prod           # Full production deployment
npm run deploy:dev            # Full development deployment

# Monitoring
npm run health:check          # Run health checks
npm run docker:logs           # View all logs
npm run docker:logs:backend   # View backend logs only
npm run docker:logs:frontend  # View frontend logs only
```

### Manual Build Process

```bash
# 1. Build backend
cd backend
npm run build

# 2. Build frontend
cd ../frontend
npm run build

# 3. Build Docker images
cd ..
docker-compose build

# 4. Start services
docker-compose up -d
```

## Health Monitoring

### Health Check Endpoints

- **Backend Health**: `http://localhost:5000/api/health`
- **Frontend Health**: `http://localhost/health`
- **Detailed Backend Health**: `http://localhost:5000/api/health/detailed`
- **Readiness Probe**: `http://localhost:5000/api/ready`
- **Liveness Probe**: `http://localhost:5000/api/live`

### Health Check Script

```bash
# Run health checks
npm run health:check

# Or manually
node scripts/health-check.js

# With custom URLs
FRONTEND_URL=https://your-domain.com BACKEND_URL=https://api.your-domain.com node scripts/health-check.js
```

### Monitoring Script

```bash
# Monitor system status
bash scripts/monitor.sh production

# For development
bash scripts/monitor.sh development
```

## SSL Configuration

### Self-Signed Certificates (Development)

```bash
# Generate self-signed certificates
bash scripts/setup-ssl.sh localhost
```

### Let's Encrypt Certificates (Production)

```bash
# Install certbot first
sudo apt-get install certbot  # Ubuntu/Debian
# or
brew install certbot          # macOS

# Generate certificates
bash scripts/setup-ssl.sh your-domain.com
```

### Custom Certificates

Place your certificates in the `ssl/` directory:
- `ssl/cert.pem` - Certificate file
- `ssl/key.pem` - Private key file

## Production Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificates generated/obtained
- [ ] Google APIs enabled and configured
- [ ] Service account credentials set up
- [ ] Domain DNS configured (if applicable)

### Deployment Steps

1. **Prepare Environment**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd nap-management-system
   
   # Configure environment
   cp .env.production .env
   # Edit .env with your values
   ```

2. **Build and Deploy**
   ```bash
   # For HTTP deployment
   npm run deploy:prod
   
   # For HTTPS deployment
   bash scripts/setup-ssl.sh your-domain.com
   docker-compose -f docker-compose.ssl.yml up -d
   ```

3. **Verify Deployment**
   ```bash
   # Check health
   npm run health:check
   
   # Monitor logs
   npm run docker:logs
   ```

### Post-Deployment

- [ ] Health checks passing
- [ ] SSL certificates valid (if HTTPS)
- [ ] Google Sheets integration working
- [ ] Authentication flow working
- [ ] Map functionality working
- [ ] Monitoring set up

## Troubleshooting

### Common Issues

#### 1. Google Sheets Connection Failed
```bash
# Check service account credentials
docker-compose logs backend | grep "Sheets"

# Verify spreadsheet permissions
# Ensure service account email has access to the spreadsheet
```

#### 2. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Regenerate certificates
bash scripts/setup-ssl.sh your-domain.com
```

#### 3. Container Health Check Failures
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs backend
docker-compose logs frontend

# Restart unhealthy containers
docker-compose restart backend
```

#### 4. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :80
netstat -tulpn | grep :443
netstat -tulpn | grep :5000

# Stop conflicting services or change ports in docker-compose.yml
```

### Log Locations

- **Backend Logs**: `logs/` directory (mounted volume)
- **Container Logs**: `docker-compose logs <service>`
- **Nginx Logs**: Inside frontend container at `/var/log/nginx/`

### Performance Monitoring

```bash
# Container resource usage
docker stats

# System monitoring
bash scripts/monitor.sh production

# Detailed health check
curl http://localhost:5000/api/health/detailed
```

## Backup and Recovery

### Backup Logs
```bash
# Backup is automatically created during deployment
# Manual backup
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp -r logs backups/$(date +%Y%m%d_%H%M%S)/
```

### Recovery
```bash
# Stop services
docker-compose down

# Restore from backup
cp -r backups/YYYYMMDD_HHMMSS/logs ./

# Restart services
docker-compose up -d
```

## Scaling and Load Balancing

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Use load balancer (nginx, HAProxy, etc.)
# Configure upstream servers in nginx.conf
```

### Resource Limits
```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Security Considerations

- Use strong JWT secrets (32+ characters)
- Keep SSL certificates updated
- Regularly update Docker images
- Monitor logs for security issues
- Use environment variables for secrets
- Enable CORS only for trusted domains
- Implement rate limiting
- Use HTTPS in production

## Support

For deployment issues:
1. Check logs: `npm run docker:logs`
2. Run health checks: `npm run health:check`
3. Monitor system: `bash scripts/monitor.sh`
4. Review this documentation
5. Check Google Cloud Console for API issues