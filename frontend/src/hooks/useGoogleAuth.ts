import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface UseGoogleAuthProps {
  onSuccess: (credential: string) => void;
  onError?: (error: any) => void;
}

export const useGoogleAuth = ({ onSuccess, onError }: UseGoogleAuthProps) => {
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onError?.(new Error('No credential received from Google'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [onSuccess, onError]);

  const renderButton = useCallback((element: HTMLElement) => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    });
  }, []);

  const promptLogin = useCallback(() => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.prompt();
  }, []);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeGoogleAuth();
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      onError?.(new Error('Failed to load Google authentication'));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [initializeGoogleAuth, onError]);

  return {
    renderButton,
    promptLogin,
    isReady: !!window.google,
  };
};