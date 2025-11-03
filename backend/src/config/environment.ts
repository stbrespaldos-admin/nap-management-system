import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface EnvironmentConfig {
  // Server Configuration
  NODE_ENV: string;
  PORT: number;
  
  // Google APIs
  GOOGLE_MAPS_API_KEY: string;
  GOOGLE_SHEETS_API_KEY: string;
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  
  // Application
  JWT_SECRET: string;
  SPREADSHEET_ID: string;
  CORS_ORIGIN: string;
  
  // Logging
  LOG_LEVEL: string;
  
  // SSL
  SSL_CERT_PATH?: string;
  SSL_KEY_PATH?: string;
  
  // Health Check
  HEALTH_CHECK_INTERVAL: number;
  HEALTH_CHECK_TIMEOUT: number;
  
  // Cache
  CACHE_TTL: number;
  REDIS_URL?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const requiredEnvVars = [
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_SHEETS_API_KEY',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'JWT_SECRET',
  'SPREADSHEET_ID'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Validate JWT secret length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export const config: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY!,
  GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY!,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  
  JWT_SECRET: process.env.JWT_SECRET!,
  SPREADSHEET_ID: process.env.SPREADSHEET_ID!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
  
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
  HEALTH_CHECK_TIMEOUT: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
  
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300000', 10),
  REDIS_URL: process.env.REDIS_URL,
  
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
};

export default config;