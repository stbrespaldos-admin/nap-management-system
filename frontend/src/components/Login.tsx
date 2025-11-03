import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setError(null);
      await login(credential);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google auth error:', error);
    setError('Error al cargar la autenticación de Google');
  };

  const { renderButton, isReady } = useGoogleAuth({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  useEffect(() => {
    if (isReady && googleButtonRef.current) {
      renderButton(googleButtonRef.current);
    }
  }, [isReady, renderButton]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '450px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '30px',
          textAlign: 'center',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            color: '#333',
            fontSize: '24px',
            fontWeight: 600
          }}>
            Sistema de Gestión de NAPs
          </h1>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '14px'
          }}>
            Inicia sesión para acceder al sistema
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c33',
              fontSize: '14px'
            }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <p style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontWeight: 500
            }}>
              Inicia sesión con tu cuenta de Google:
            </p>
            
            {isLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666'
              }}>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <div 
                ref={googleButtonRef} 
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              />
            )}
          </div>

          <div style={{
            borderTop: '1px solid #e9ecef',
            paddingTop: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Información del Sistema
            </h3>
            <ul style={{
              margin: '0 0 15px 0',
              paddingLeft: '20px'
            }}>
              <li style={{
                marginBottom: '8px',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>Técnicos de Campo:</strong> Pueden ver el mapa y registrar NAPs
              </li>
              <li style={{
                marginBottom: '8px',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>Técnicos Validadores:</strong> Pueden validar y aprobar NAPs
              </li>
              <li style={{
                marginBottom: '8px',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>Administradores:</strong> Acceso completo al sistema
              </li>
            </ul>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              Si no tienes acceso, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Login;