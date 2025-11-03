// Servicio para manejo de funcionalidades PWA
export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private onlineCallbacks: Array<() => void> = [];
  private offlineCallbacks: Array<() => void> = [];

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Inicializar Service Worker
   */
  async initializeServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers no están soportados en este navegador');
      return false;
    }

    try {
      console.log('Registrando Service Worker...');
      
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado exitosamente:', this.swRegistration);

      // Manejar actualizaciones del Service Worker
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              this.notifyUpdate();
            }
          });
        }
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      return true;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return false;
    }
  }

  /**
   * Verificar si la app puede ser instalada
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Mostrar prompt de instalación
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('No hay prompt de instalación disponible');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      console.log('Resultado de instalación:', choiceResult.outcome);
      
      // Limpiar el prompt después de usarlo
      this.deferredPrompt = null;
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error mostrando prompt de instalación:', error);
      return false;
    }
  }

  /**
   * Verificar si la app está instalada
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Solicitar permisos de notificación
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notificaciones no están soportadas');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Permiso de notificaciones:', permission);
    return permission;
  }

  /**
   * Mostrar notificación local
   */
  async showNotification(options: NotificationOptions): Promise<boolean> {
    const permission = await this.requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Permisos de notificación denegados');
      return false;
    }

    try {
      if (this.swRegistration) {
        // Usar Service Worker para notificaciones persistentes
        const notificationOptions: any = {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: options.tag || 'nap-notification',
          requireInteraction: options.requireInteraction || false,
          data: {
            timestamp: Date.now(),
            url: window.location.origin
          }
        };
        
        if (options.actions) {
          notificationOptions.actions = options.actions;
        }
        
        await this.swRegistration.showNotification(options.title, notificationOptions);
      } else {
        // Fallback a notificación simple
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return false;
    }
  }

  /**
   * Suscribirse a notificaciones push
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker no está registrado');
      return null;
    }

    try {
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      const subscribeOptions: any = {
        userVisibleOnly: true
      };
      
      if (vapidKey) {
        subscribeOptions.applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
      }
      
      const subscription = await this.swRegistration.pushManager.subscribe(subscribeOptions);

      console.log('Suscripción push creada:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error creando suscripción push:', error);
      return null;
    }
  }

  /**
   * Verificar estado de conexión
   */
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Agregar callback para cuando se recupere la conexión
   */
  onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  /**
   * Agregar callback para cuando se pierda la conexión
   */
  onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }

  /**
   * Obtener información de la instalación
   */
  getInstallationInfo() {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled(),
      isOnline: this.isOnlineStatus(),
      hasServiceWorker: !!this.swRegistration,
      notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported'
    };
  }

  /**
   * Forzar actualización del Service Worker
   */
  async updateServiceWorker(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
      
      // Enviar mensaje para saltar la espera
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }

  /**
   * Obtener versión del Service Worker
   */
  async getServiceWorkerVersion(): Promise<string> {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve('No disponible');
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || 'Desconocida');
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  // Métodos privados
  private initializeEventListeners(): void {
    // Escuchar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      console.log('Prompt de instalación disponible');
    });

    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conexión recuperada');
      this.onlineCallbacks.forEach(callback => callback());
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Conexión perdida');
      this.offlineCallbacks.forEach(callback => callback());
    });

    // Escuchar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente');
      this.deferredPrompt = null;
    });
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    if (data.type === 'SW_UPDATE_AVAILABLE') {
      this.notifyUpdate();
    }
  }

  private notifyUpdate(): void {
    // Notificar que hay una actualización disponible
    console.log('Nueva versión de la aplicación disponible');
    
    // Aquí podrías mostrar una notificación al usuario
    // o emitir un evento personalizado
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    if (!base64String) {
      return new Uint8Array(0);
    }
    
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Exportar instancia singleton
export const pwaService = new PWAService();
export default pwaService;