import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PWAInstallPrompt from '../PWAInstallPrompt';
import PWAUpdateNotification from '../PWAUpdateNotification';
import OfflineIndicator from '../OfflineIndicator';

// Mock del hook usePWA
jest.mock('../../hooks/usePWA', () => ({
  usePWA: () => ({
    canInstall: true,
    isInstalled: false,
    updateAvailable: true,
    install: jest.fn().mockResolvedValue(true),
    updateApp: jest.fn().mockResolvedValue(undefined),
    isLoading: false
  }),
  useOnlineStatus: () => true
}));

describe('PWA Components', () => {
  describe('PWAInstallPrompt', () => {
    it('should render install prompt when app can be installed', () => {
      render(<PWAInstallPrompt />);
      
      expect(screen.getByText('Instalar Aplicación')).toBeInTheDocument();
      expect(screen.getByText(/Instala NAP Management/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Instalar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ahora no' })).toBeInTheDocument();
    });

    it('should call onInstall when install button is clicked', async () => {
      const mockOnInstall = jest.fn();
      render(<PWAInstallPrompt onInstall={mockOnInstall} />);
      
      const installButton = screen.getByRole('button', { name: 'Instalar' });
      fireEvent.click(installButton);
      
      await waitFor(() => {
        expect(mockOnInstall).toHaveBeenCalledWith(true);
      });
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const mockOnDismiss = jest.fn();
      render(<PWAInstallPrompt onDismiss={mockOnDismiss} />);
      
      const dismissButton = screen.getByRole('button', { name: 'Ahora no' });
      fireEvent.click(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('PWAUpdateNotification', () => {
    it('should render update notification when update is available', () => {
      render(<PWAUpdateNotification />);
      
      expect(screen.getByText('Actualización Disponible')).toBeInTheDocument();
      expect(screen.getByText(/Hay una nueva versión/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Después' })).toBeInTheDocument();
    });

    it('should call onUpdate when update button is clicked', async () => {
      const mockOnUpdate = jest.fn();
      render(<PWAUpdateNotification onUpdate={mockOnUpdate} />);
      
      const updateButton = screen.getByRole('button', { name: 'Actualizar' });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('OfflineIndicator', () => {
    it('should not render when online and showWhenOnline is false', () => {
      const { container } = render(<OfflineIndicator />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when showWhenOnline is true', () => {
      render(<OfflineIndicator showWhenOnline={true} />);
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });
  });
});

describe('PWA Service Worker', () => {
  beforeEach(() => {
    // Mock Service Worker API
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({
          addEventListener: jest.fn(),
          waiting: null,
          installing: null
        }),
        addEventListener: jest.fn(),
        controller: null
      },
      writable: true
    });
  });

  it('should register service worker in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { pwaService } = await import('../../services/pwaService');
    const result = await pwaService.initializeServiceWorker();

    expect(result).toBe(true);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/'
    });

    process.env.NODE_ENV = originalEnv;
  });
});

describe('PWA Utilities', () => {
  it('should detect mobile devices correctly', async () => {
    const { isMobileDevice } = await import('../../utils/pwaUtils');
    
    // Mock user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true
    });

    expect(isMobileDevice()).toBe(true);
  });

  it('should detect PWA installation correctly', async () => {
    const { isPWAInstalled } = await import('../../utils/pwaUtils');
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    expect(isPWAInstalled()).toBe(true);
  });

  it('should optimize images for mobile devices', async () => {
    const { optimizeImageForDevice } = await import('../../utils/pwaUtils');
    
    const originalUrl = 'https://example.com/image.jpg';
    const optimizedUrl = optimizeImageForDevice(originalUrl);
    
    expect(optimizedUrl).toBe(originalUrl); // Should return original for non-Google Drive URLs
  });

  it('should debounce function calls correctly', async () => {
    const { debounce } = await import('../../utils/pwaUtils');
    
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);
    
    debouncedFn('test1');
    debouncedFn('test2');
    debouncedFn('test3');
    
    expect(mockFn).not.toHaveBeenCalled();
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test3');
  });
});