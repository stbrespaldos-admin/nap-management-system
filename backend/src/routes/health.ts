import { Router, Request, Response } from 'express';

// Extend Request interface to include startTime
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}
import { config } from '../config/environment';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    googleSheets: 'connected' | 'disconnected' | 'error';
    googleMaps: 'connected' | 'disconnected' | 'error';
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      services: {
        database: 'connected', // Since we're using Google Sheets as database
        googleSheets: await checkGoogleSheetsHealth(),
        googleMaps: await checkGoogleMapsHealth()
      },
      system: {
        memory: getMemoryUsage(),
        cpu: {
          usage: process.cpuUsage().user / 1000000 // Convert to seconds
        }
      }
    };

    // Check if any service is unhealthy
    const servicesHealthy = Object.values(healthStatus.services).every(
      service => service === 'connected'
    );

    if (!servicesHealthy) {
      healthStatus.status = 'unhealthy';
      return res.status(503).json(healthStatus);
    }

    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealth = {
      ...await getBasicHealth(),
      dependencies: {
        googleSheets: await getGoogleSheetsStatus(),
        googleMaps: await getGoogleMapsStatus()
      },
      performance: {
        responseTime: req.startTime ? Date.now() - req.startTime : 0,
        requestsPerMinute: getRequestsPerMinute(),
        errorRate: getErrorRate()
      }
    };

    return res.status(200).json(detailedHealth);
  } catch (error) {
    console.error('Detailed health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      error: 'Detailed health check failed'
    });
  }
});

// Readiness probe
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    const sheetsReady = await checkGoogleSheetsHealth() === 'connected';
    
    if (sheetsReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'Google Sheets not available' });
    }
  } catch (error: any) {
    res.status(503).json({ status: 'not ready', error: error?.message || 'Unknown error' });
  }
});

// Liveness probe
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Helper functions
async function checkGoogleSheetsHealth(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    // Import sheets service dynamically to avoid circular dependencies
    const { SheetsService } = await import('../services/sheetsService');
    const sheetsService = new SheetsService();
    
    // Try to access the spreadsheet
    await sheetsService.testConnection();
    return 'connected';
  } catch (error) {
    console.error('Google Sheets health check failed:', error);
    return 'error';
  }
}

async function checkGoogleMapsHealth(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    // Simple check to verify API key is configured
    if (!config.GOOGLE_MAPS_API_KEY) {
      return 'disconnected';
    }
    
    // Could add actual API call here if needed
    return 'connected';
  } catch (error) {
    console.error('Google Maps health check failed:', error);
    return 'error';
  }
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  return {
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
  };
}

async function getBasicHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.NODE_ENV
  };
}

async function getGoogleSheetsStatus() {
  try {
    const { SheetsService } = await import('../services/sheetsService');
    const sheetsService = new SheetsService();
    const startTime = Date.now();
    await sheetsService.testConnection();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected',
      responseTime,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: (error as any)?.message || 'Unknown error',
      lastCheck: new Date().toISOString()
    };
  }
}

async function getGoogleMapsStatus() {
  return {
    status: config.GOOGLE_MAPS_API_KEY ? 'configured' : 'not configured',
    lastCheck: new Date().toISOString()
  };
}

// Simple metrics (in production, use proper metrics collection)
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

function getRequestsPerMinute() {
  const uptimeMinutes = (Date.now() - startTime) / 60000;
  return Math.round(requestCount / uptimeMinutes);
}

function getErrorRate() {
  return requestCount > 0 ? Math.round((errorCount / requestCount) * 100) : 0;
}

// Middleware to track requests
export const trackRequest = (req: Request, res: Response, next: Function) => {
  req.startTime = Date.now();
  requestCount++;
  
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });
  
  next();
};

export default router;