import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

const LoginDebug: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Debug info
  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleTestLogin = async () => {
    try {
      setError(null);
      // Simulate a successful login with mock data
      await login('mock-google-credential-for-testing');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    }
  };

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
            Modo de Pruebas - Debug
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
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
              Información de Debug:
            </h3>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
              <p><strong>Client ID:</strong> {clientId || 'No configurado'}</p>
              <p><strong>API URL:</strong> {apiUrl || 'No configurado'}</p>
              <p><strong>Backend Status:</strong> {isLoading ? 'Cargando...' : 'Listo'}</p>
            </div>
            
            <button
              onClick={handleTestLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Iniciando sesión...' : '🚀 Probar Login (Modo Demo)'}
            </button>
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
              Modo de pruebas - Backend simplificado activo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;