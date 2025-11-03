import { useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logError?: boolean;
  onError?: (error: any) => void;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: any, 
    context: string = 'Unknown',
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showNotification = true,
      logError = true,
      onError
    } = options;

    // Log error details
    if (logError) {
      console.error(`Error in ${context}:`, error);
    }

    // Determine error type and message
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorType: 'network' | 'validation' | 'permission' | 'session' | 'api' | 'generic' = 'generic';

    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      errorType = 'network';
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error?.response?.status === 401) {
      errorType = 'session';
      errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error?.response?.status === 403) {
      errorType = 'permission';
      errorMessage = 'No tienes permisos para realizar esta acción.';
    } else if (error?.response?.status === 422 || error?.response?.status === 400) {
      errorType = 'validation';
      errorMessage = error?.response?.data?.error?.message || 'Error de validación en los datos enviados.';
    } else if (error?.response?.data?.error?.message) {
      errorType = 'api';
      errorMessage = error.response.data.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Show notification based on error type
    if (showNotification) {
      switch (errorType) {
        case 'network':
          notificationService.networkError();
          break;
        case 'session':
          notificationService.sessionExpired();
          break;
        case 'permission':
          notificationService.permissionDenied();
          break;
        case 'validation':
          notificationService.validationError(errorMessage);
          break;
        case 'api':
          notificationService.apiError(error, errorMessage);
          break;
        default:
          notificationService.error(errorMessage);
      }
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }

    // Return error details for further handling
    return {
      type: errorType,
      message: errorMessage,
      originalError: error,
      context
    };
  }, []);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    context: string = 'Async operation',
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw so calling code can handle it
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

export default useErrorHandler;