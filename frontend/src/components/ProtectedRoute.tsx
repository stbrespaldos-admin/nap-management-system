import React from 'react';
import { useAuth } from './AuthProvider';
import LoginDebug from './Login-debug';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'tecnico_campo' | 'tecnico_validador' | 'administrador'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Verificando autenticación...</p>
        </div>


      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginDebug />;
  }

  // Check role permissions if required
  if (requiredRoles && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>🚫</div>
            <h2 style={{
              color: '#dc3545',
              margin: '0 0 20px 0',
              fontSize: '24px'
            }}>
              Acceso Denegado
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '20px',
              lineHeight: 1.5
            }}>
              No tienes permisos para acceder a esta sección del sistema.
            </p>
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '20px',
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <p style={{ margin: '8px 0', color: '#333' }}>
                <strong>Usuario:</strong> {user.name}
              </p>
              <p style={{ margin: '8px 0', color: '#333' }}>
                <strong>Rol actual:</strong> {user.role}
              </p>
              <p style={{ margin: '8px 0', color: '#333' }}>
                <strong>Roles requeridos:</strong> {requiredRoles.join(', ')}
              </p>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>


        </div>
      );
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;