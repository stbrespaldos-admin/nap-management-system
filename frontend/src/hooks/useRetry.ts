import { useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  showNotifications?: boolean;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError?: any;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    showNotifications = true
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0
  });

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setRetryState({ isRetrying: attempt > 1, attempt });
        
        const result = await operation();
        
        // Success - reset state
        setRetryState({ isRetrying: false, attempt: 0 });
        
        if (attempt > 1 && showNotifications) {
          notificationService.success(`${operationName} completada exitosamente`);
        }
        
        return result;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt === maxAttempts || !retryCondition(error)) {
          setRetryState({ isRetrying: false, attempt: 0, lastError: error });
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        if (showNotifications) {
          notificationService.warning(
            `${operationName} falló. Reintentando en ${Math.round(delay / 1000)} segundos... (${attempt}/${maxAttempts})`
          );
        }

        // Wait before retrying
        await sleep(delay);
      }
    }

    setRetryState({ isRetrying: false, attempt: 0, lastError });
    throw lastError;
  }, [maxAttempts, baseDelay, maxDelay, backoffFactor, retryCondition, showNotifications]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    return executeWithRetry(operation, operationName);
  }, [executeWithRetry]);

  return {
    retry,
    retryState,
    isRetrying: retryState.isRetrying
  };
};

/**
 * Default retry condition - retries on network errors and 5xx status codes
 */
function defaultRetryCondition(error: any): boolean {
  // Retry on network errors
  if (error?.code === 'NETWORK_ERROR' || 
      error?.message?.includes('Network Error') ||
      error?.message?.includes('fetch')) {
    return true;
  }

  // Retry on 5xx HTTP status codes
  if (error?.response?.status >= 500) {
    return true;
  }

  // Retry on timeout errors
  if (error?.code === 'ECONNABORTED' || 
      error?.message?.includes('timeout')) {
    return true;
  }

  // Don't retry on client errors (4xx) or authentication errors
  return false;
}

/**
 * Retry condition for Google APIs
 */
export function googleApiRetryCondition(error: any): boolean {
  // Use default condition first
  if (defaultRetryCondition(error)) {
    return true;
  }

  // Google API specific conditions
  if (error?.response?.status === 429 || // Rate limit
      error?.response?.data?.error?.code === 'RATE_LIMIT_EXCEEDED' ||
      error?.response?.data?.error?.code === 'QUOTA_EXCEEDED') {
    return true;
  }

  return false;
}

export default useRetry;