import { useState, useEffect, useCallback } from 'react';
import { pwaService, NotificationOptions } from '../services/pwaService';

export interface PWAState {
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  hasServiceWorker: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  isLoading: boolean;
}

export interface PWAActions {
  install: () => Promise<boolean>;
  showNotification: (options: NotificationOptions) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  updateApp: () => Promise<void>;
  getVersion: () => Promise<string>;
}

/**
 * Hook personalizado para manejar funcionalidades PWA
 */
export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    canInstall: false,
    isInstalled: false,
    hasServiceWorker: false,
    notificationPermission: 'default',
    isLoading: true
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Inicializar PWA
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Inicializar Service Worker
        const swInitialized = await pwaService.initializeServiceWorker();
        
        // Obtener información inicial
        const info = pwaService.getInstallationInfo();
        
        setState({
          isOnline: info.isOnline,
          canInstall: info.canInstall,
          isInstalled: info.isInstalled,
          hasServiceWorker: info.hasServiceWorker,
          notificationPermission: info.notificationPermission as NotificationPermission,
          isLoading: false
        });

        console.log('PWA inicializada:', { swInitialized, ...info });
      } catch (error) {
        console.error('Error inicializando PWA:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializePWA();
  }, []);

  // Escuchar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    pwaService.onOnline(handleOnline);
    pwaService.onOffline(handleOffline);

    return () => {
      // No hay método para remover listeners en el servicio actual
      // En una implementación más completa, se agregarían métodos removeOnline/removeOffline
    };
  }, []);

  // Escuchar evento de instalación disponible
  useEffect(() => {
    const handleBeforeInstallPrompt = () => {
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        canInstall: false, 
        isInstalled: true 
      }));
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  // Acciones PWA
  const install = useCallback(async (): Promise<boolean> => {
    const result = await pwaService.showInstallPrompt();
    if (result) {
      setState(prev => ({ 
        ...prev, 
        canInstall: false, 
        isInstalled: true 
      }));
    }
    return result;
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    return await pwaService.showNotification(options);
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    const permission = await pwaService.requestNotificationPermission();
    setState(prev => ({ ...prev, notificationPermission: permission }));
    return permission;
  }, []);

  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    return await pwaService.subscribeToPushNotifications();
  }, []);

  const updateApp = useCallback(async (): Promise<void> => {
    await pwaService.updateServiceWorker();
    setUpdateAvailable(false);
    // Recargar la página después de un breve delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  const getVersion = useCallback(async (): Promise<string> => {
    return await pwaService.getServiceWorkerVersion();
  }, []);

  const actions: PWAActions = {
    install,
    showNotification,
    requestNotificationPermission,
    subscribeToPush,
    updateApp,
    getVersion
  };

  return {
    ...state,
    updateAvailable,
    ...actions
  };
};

/**
 * Hook simplificado para verificar solo el estado online/offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    pwaService.onOnline(handleOnline);
    pwaService.onOffline(handleOffline);

    // También escuchar eventos nativos como fallback
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook para manejar notificaciones PWA
 */
export const usePWANotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPermission = useCallback(async () => {
    const newPermission = await pwaService.requestNotificationPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    return await pwaService.showNotification(options);
  }, []);

  const canShowNotifications = permission === 'granted';

  return {
    permission,
    canShowNotifications,
    requestPermission,
    showNotification
  };
};