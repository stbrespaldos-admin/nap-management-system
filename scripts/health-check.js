#!/usr/bin/env node

const http = require('http');
const https = require('https');

const config = {
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost',
    path: '/health',
    timeout: 5000
  },
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:5000',
    path: '/api/health',
    timeout: 5000
  }
};

function checkService(name, serviceConfig) {
  return new Promise((resolve, reject) => {
    const url = new URL(serviceConfig.path, serviceConfig.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const startTime = Date.now();
    
    const req = client.request(url, {
      method: 'GET',
      timeout: serviceConfig.timeout
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            name,
            status: 'healthy',
            statusCode: res.statusCode,
            responseTime,
            url: url.toString()
          });
        } else {
          reject({
            name,
            status: 'unhealthy',
            statusCode: res.statusCode,
            responseTime,
            url: url.toString(),
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        name,
        status: 'error',
        responseTime: Date.now() - startTime,
        url: url.toString(),
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({
        name,
        status: 'timeout',
        responseTime: Date.now() - startTime,
        url: url.toString(),
        error: `Timeout after ${serviceConfig.timeout}ms`
      });
    });
    
    req.end();
  });
}

async function runHealthChecks() {
  console.log('🏥 NAP Management System - Health Check');
  console.log('=====================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');
  
  const checks = [
    checkService('Backend', config.backend),
    checkService('Frontend', config.frontend)
  ];
  
  const results = await Promise.allSettled(checks);
  let allHealthy = true;
  
  results.forEach((result, index) => {
    const serviceName = index === 0 ? 'Backend' : 'Frontend';
    
    if (result.status === 'fulfilled') {
      const { status, statusCode, responseTime, url } = result.value;
      console.log(`✅ ${serviceName}: ${status.toUpperCase()}`);
      console.log(`   URL: ${url}`);
      console.log(`   Status Code: ${statusCode}`);
      console.log(`   Response Time: ${responseTime}ms`);
    } else {
      const { name, status, statusCode, responseTime, url, error } = result.reason;
      console.log(`❌ ${serviceName}: ${status.toUpperCase()}`);
      console.log(`   URL: ${url}`);
      if (statusCode) console.log(`   Status Code: ${statusCode}`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Error: ${error}`);
      allHealthy = false;
    }
    console.log('');
  });
  
  // Overall status
  if (allHealthy) {
    console.log('🎉 Overall Status: HEALTHY');
    process.exit(0);
  } else {
    console.log('⚠️  Overall Status: UNHEALTHY');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('NAP Management System Health Check');
  console.log('');
  console.log('Usage: node health-check.js [options]');
  console.log('');
  console.log('Environment Variables:');
  console.log('  FRONTEND_URL  Frontend URL (default: http://localhost)');
  console.log('  BACKEND_URL   Backend URL (default: http://localhost:5000)');
  console.log('');
  console.log('Exit Codes:');
  console.log('  0  All services healthy');
  console.log('  1  One or more services unhealthy');
  process.exit(0);
}

// Run health checks
runHealthChecks().catch((error) => {
  console.error('❌ Health check script failed:', error);
  process.exit(1);
});