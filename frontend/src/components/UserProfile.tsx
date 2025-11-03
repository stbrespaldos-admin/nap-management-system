import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'tecnico_campo':
        return 'Técnico de Campo';
      case 'tecnico_validador':
        return 'Técnico Validador';
      case 'administrador':
        return 'Administrador';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrador':
        return '#dc3545';
      case 'tecnico_validador':
        return '#28a745';
      case 'tecnico_campo':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '200px'
        }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px'
        }}>
          <span style={{
            fontWeight: 500,
            color: '#1f2937',
            fontSize: '14px'
          }}>
            {user.name}
          </span>
          <span style={{
            fontSize: '11px',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backgroundColor: getRoleBadgeColor(user.role)
          }}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
        <svg 
          style={{
            transition: 'transform 0.2s ease',
            color: '#6b7280',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsDropdownOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            minWidth: '280px',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px',
              background: '#f8f9fa'
            }}>
              <div>
                <h4 style={{
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  {user.name}
                </h4>
                <p style={{
                  margin: '0 0 12px 0',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {user.email}
                </p>
                <span style={{
                  fontSize: '11px',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: getRoleBadgeColor(user.role)
                }}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
            
            <div style={{
              height: '1px',
              background: '#e1e5e9'
            }} />
            
            <div style={{ padding: '8px' }}>
              <button 
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#dc3545',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={handleLogout}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path 
                    d="M6 2a1 1 0 000 2h4a1 1 0 001-1V2a1 1 0 00-1-1H6zM3 6a1 1 0 011-1h8a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" 
                    fill="currentColor"
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default UserProfile;