import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import napsRoutes from './routes/napsRoutes';
import healthRoutes, { trackRequest } from './routes/health';
import { sheetsService } from './services/sheetsService';
import logger from './config/logger';
import { 
  errorHandler, 
  notFoundHandler, 
  requestIdMiddleware, 
  httpLoggerMiddleware,
  handleUnhandledRejection,
  handleUncaughtException
} from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Setup global error handlers
handleUnhandledRejection();
handleUncaughtException();

const app = express();
const PORT = process.env.PORT || 5000;

// Request ID and logging middleware (must be first)
app.use(requestIdMiddleware);
app.use(httpLoggerMiddleware);

// Request tracking for health metrics
app.use(trackRequest);

// Security middleware
app.use(helmet());

// Compression middleware (should be early in the middleware stack)
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9, 6 is default)
  threshold: 1024, // Only compress responses larger than 1KB
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const sheetsHealth = await sheetsService.getHealthStatus();
    const cacheStats = sheetsService.getCacheStats();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'NAP Management API',
      services: {
        sheets: sheetsHealth,
        cache: cacheStats
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      service: 'NAP Management API',
      error: 'Health check failed'
    });
  }
});

// Health routes (before API routes for priority)
app.use('/api', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/naps', napsRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize Google Sheets service
    await sheetsService.initialize();
    logger.info('Google Sheets service initialized');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/health`,
        napsAPI: `http://localhost:${PORT}/api/naps`,
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error?.message || error, stack: error?.stack });
    process.exit(1);
  }
}

startServer();

export default app;