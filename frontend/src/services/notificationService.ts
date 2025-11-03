import toast, { ToastOptions } from 'react-hot-toast';

export interface NotificationOptions extends ToastOptions {
  autoClose?: boolean;
  closeButton?: boolean;
}

class NotificationService {
  private defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
  };

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions): string {
    return toast.success(message, {
      ...this.defaultOptions,
      ...options,
      icon: '✅',
    });
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions): string {
    return toast.error(message, {
      ...this.defaultOptions,
      duration: 6000, // Longer duration for errors
      ...options,
      icon: '❌',
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        background: '#DBEAFE',
        color: '#1E40AF',
        border: '1px solid #3B82F6',
      },
    });
  }

  /**
   * Show loading notification
   */
  loading(message: string, options?: NotificationOptions): string {
    return toast.loading(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Update an existing toast
   */
  update(toastId: string, message: string, type: 'success' | 'error' | 'loading' = 'success'): void {
    if (type === 'success') {
      toast.success(message, { id: toastId });
    } else if (type === 'error') {
      toast.error(message, { id: toastId });
    } else if (type === 'loading') {
      toast.loading(message, { id: toastId });
    }
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId?: string): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Show API error notification with proper formatting
   */
  apiError(error: any, defaultMessage: string = 'Ha ocurrido un error'): string {
    let message = defaultMessage;
    
    if (error?.response?.data?.error?.message) {
      message = error.response.data.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    // Add request ID if available for debugging
    const requestId = error?.response?.headers?.['x-request-id'];
    if (requestId && process.env.NODE_ENV === 'development') {
      message += ` (ID: ${requestId})`;
    }

    return this.error(message);
  }

  /**
   * Show network error notification
   */
  networkError(): string {
    return this.error(
      'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
      { duration: 8000 }
    );
  }

  /**
   * Show offline notification
   */
  offline(): string {
    return this.warning(
      'Sin conexión a internet. Algunas funciones pueden no estar disponibles.',
      { duration: 0 } // Don't auto-dismiss
    );
  }

  /**
   * Show online notification
   */
  online(): string {
    return this.success('Conexión restaurada');
  }

  /**
   * Show validation error notification
   */
  validationError(errors: string[] | string): string {
    const message = Array.isArray(errors) 
      ? errors.join(', ')
      : errors;
    
    return this.error(`Error de validación: ${message}`);
  }

  /**
   * Show permission denied notification
   */
  permissionDenied(): string {
    return this.error('No tienes permisos para realizar esta acción');
  }

  /**
   * Show session expired notification
   */
  sessionExpired(): string {
    return this.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }

  /**
   * Show custom notification with retry action
   */
  withRetry(
    message: string, 
    onRetry: () => void, 
    type: 'error' | 'warning' = 'error'
  ): string {
    const toastId = type === 'error' 
      ? this.error(message, { duration: 0 })
      : this.warning(message, { duration: 0 });

    // Add retry button (this would need custom toast component)
    // For now, we'll just show the message
    return toastId;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;