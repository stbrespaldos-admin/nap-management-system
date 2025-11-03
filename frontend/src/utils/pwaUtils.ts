/**
 * Utilidades para optimización PWA y rendimiento móvil
 */

/**
 * Detectar si la aplicación se está ejecutando como PWA instalada
 */
export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Detectar si el dispositivo es móvil
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detectar si el dispositivo tiene conexión lenta
 */
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    (connection.downlink && connection.downlink < 1.5)
  );
};

/**
 * Optimizar imágenes para dispositivos móviles
 */
export const optimizeImageForDevice = (
  originalUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  const {
    maxWidth = isMobileDevice() ? 800 : 1200,
    maxHeight = isMobileDevice() ? 600 : 800,
    quality = isSlowConnection() ? 70 : 85,
    format = 'webp'
  } = options;

  // Si la URL ya tiene parámetros de optimización, devolverla tal como está
  if (originalUrl.includes('w_') || originalUrl.includes('h_') || originalUrl.includes('q_')) {
    return originalUrl;
  }

  // Para URLs de Google Drive o servicios similares, aplicar transformaciones
  if (originalUrl.includes('drive.google.com')) {
    return `${originalUrl}&sz=w${maxWidth}-h${maxHeight}`;
  }

  // Para otras URLs, devolver la original (en una implementación real,
  // aquí se podría integrar con un servicio de optimización de imágenes)
  return originalUrl;
};

/**
 * Precargar recursos críticos
 */
export const preloadCriticalResources = (resources: string[]): void => {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
      link.setAttribute('crossorigin', 'anonymous');
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

/**
 * Lazy loading de componentes con fallback
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => React.createElement('div', null, 'Cargando...')
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(
      React.Suspense,
      { fallback: React.createElement(fallback) },
      React.createElement(LazyComponent, props)
    );
};

/**
 * Debounce para optimizar búsquedas y filtros
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle para eventos de scroll y resize
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Gestión de memoria para listas grandes
 */
export const createVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

/**
 * Comprimir datos para almacenamiento local
 */
export const compressData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Implementación simple de compresión (en producción usar una librería como pako)
    return btoa(jsonString);
  } catch (error) {
    console.error('Error comprimiendo datos:', error);
    return '';
  }
};

/**
 * Descomprimir datos del almacenamiento local
 */
export const decompressData = <T>(compressedData: string): T | null => {
  try {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error descomprimiendo datos:', error);
    return null;
  }
};

/**
 * Gestión inteligente de cache
 */
export const cacheManager = {
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Error guardando en cache:', error);
    }
  },
  
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('Error leyendo cache:', error);
      return null;
    }
  },
  
  clear: (pattern?: string) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * Monitoreo de rendimiento
 */
export const performanceMonitor = {
  mark: (name: string) => {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.warn('Error midiendo rendimiento:', error);
      }
    }
    return 0;
  },
  
  getMetrics: () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    }
    return null;
  }
};

// Importar React para el lazy loading
import React from 'react';