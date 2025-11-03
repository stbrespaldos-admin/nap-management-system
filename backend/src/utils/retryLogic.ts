import logger from '../config/logger';
import { ExternalServiceError } from '../types/errors';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

export class RetryableError extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = 'RetryableError';
  }
}

/**
 * Executes a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      logger.warn('Operation failed, retrying...', {
        attempt,
        maxAttempts,
        delay,
        error: (error as any)?.message || error,
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Default retry condition - retries on network errors and 5xx status codes
 */
function defaultRetryCondition(error: any): boolean {
  // Retry on network errors
  if (error.code === 'ECONNRESET' || 
      error.code === 'ENOTFOUND' || 
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT') {
    return true;
  }

  // Retry on 5xx HTTP status codes
  if (error.response && error.response.status >= 500) {
    return true;
  }

  // Retry on specific Google API errors
  if (error.code === 'RATE_LIMIT_EXCEEDED' || 
      error.code === 'QUOTA_EXCEEDED' ||
      error.message?.includes('quota exceeded') ||
      error.message?.includes('rate limit')) {
    return true;
  }

  // Don't retry on client errors (4xx) or authentication errors
  return false;
}

/**
 * Retry condition specifically for Google Sheets API
 */
export function googleSheetsRetryCondition(error: any): boolean {
  // Always use default condition first
  if (defaultRetryCondition(error)) {
    return true;
  }

  // Additional Google Sheets specific conditions
  if (error.message?.includes('Service unavailable') ||
      error.message?.includes('Backend Error') ||
      error.message?.includes('Internal error')) {
    return true;
  }

  return false;
}

/**
 * Retry condition for Google Maps API
 */
export function googleMapsRetryCondition(error: any): boolean {
  if (defaultRetryCondition(error)) {
    return true;
  }

  // Google Maps specific errors that can be retried
  if (error.message?.includes('OVER_QUERY_LIMIT') ||
      error.message?.includes('UNKNOWN_ERROR')) {
    return true;
  }

  return false;
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new ExternalServiceError(
          'Circuit Breaker',
          'Service temporarily unavailable'
        );
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.warn('Circuit breaker opened', {
        failures: this.failures,
        threshold: this.failureThreshold,
      });
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Sleep utility function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrapper for Google Sheets operations with retry logic
 */
export async function withSheetsRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Google Sheets operation'
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    retryCondition: googleSheetsRetryCondition,
    onRetry: (error, attempt) => {
      logger.warn(`${operationName} failed, retrying...`, {
        attempt,
        error: error.message,
      });
    },
  });
}

/**
 * Wrapper for Google Maps operations with retry logic
 */
export async function withMapsRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Google Maps operation'
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    retryCondition: googleMapsRetryCondition,
    onRetry: (error, attempt) => {
      logger.warn(`${operationName} failed, retrying...`, {
        attempt,
        error: error.message,
      });
    },
  });
}