import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useNaps } from '../hooks/useNaps';
import { useAuth } from './AuthProvider';
import { NAP } from '../types/nap';
import LoadingSpinner from './LoadingSpinner';
import UserProfile from './UserProfile';

// Lazy load heavy components
const MapView = lazy(() => import('./MapView'));
const MapFilters = lazy(() => import('./MapFilters'));
const NapDetails = lazy(() => import('./NapDetails'));
const ValidationPanel = lazy(() => import('./ValidationPanel'));

const Dashboard: React.FC = () => {
  const { naps, loading, error, validateNap, refreshNaps } = useNaps(true); // Enable real-time updates
  const { user } = useAuth();
  const [selectedNap, setSelectedNap] = useState<NAP | null>(null);
  const [filterState, setFilterState] = useState<NAP['status'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'map' | 'validation'>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter NAPs based on search query
  const filteredNaps = useMemo(() => {
    if (!searchQuery.trim()) {
      return naps;
    }

    const query = searchQuery.toLowerCase().trim();
    return naps.filter(nap => 
      nap.id.toLowerCase().includes(query) ||
      nap.municipality.toLowerCase().includes(query) ||
      nap.sector.toLowerCase().includes(query) ||
      nap.registeredBy.toLowerCase().includes(query) ||
      nap.observations.toLowerCase().includes(query)
    );
  }, [naps, searchQuery]);

  // Calculate NAP counts for each status (based on filtered NAPs)
  const napCounts = useMemo(() => {
    const counts: Record<NAP['status'] | 'all', number> = {
      all: filteredNaps.length,
      pendiente: 0,
      en_construccion: 0,
      activo: 0,
      validado: 0,
      rechazado: 0,
    };

    filteredNaps.forEach(nap => {
      counts[nap.status]++;
    });

    return counts;
  }, [filteredNaps]);

  // Check if user can validate based on role
  const canValidate = user?.role === 'tecnico_validador' || user?.role === 'administrador';

  const handleMarkerClick = (nap: NAP) => {
    setSelectedNap(nap);
  };

  const handleValidateNap = async (napId: string, validationData: { status: NAP['status']; comments?: string }) => {
    try {
      await validateNap(napId, validationData);
      // Refresh the NAPs list to get updated data
      refreshNaps();
    } catch (error) {
      console.error('Error validating NAP:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e1e5e9',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: '16px' }}>Cargando datos de NAPs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#dc3545',
          maxWidth: '400px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Error al cargar datos</h2>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>{error}</p>
          <button
            onClick={refreshNaps}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e1e5e9',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}>
          <h1 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 600,
          }}>
            Sistema de Gestión de NAPs
          </h1>
          <UserProfile />
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '4px',
            }}>
              {napCounts.all}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
            }}>
              Total NAPs
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#FFA500',
              marginBottom: '4px',
            }}>
              {napCounts.pendiente}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
            }}>
              Pendientes
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#008000',
              marginBottom: '4px',
            }}>
              {napCounts.validado}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
            }}>
              Validados
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#32CD32',
              marginBottom: '4px',
            }}>
              {napCounts.activo}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
            }}>
              Activos
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '8px 8px 0 0',
          border: '1px solid #e1e5e9',
          borderBottom: 'none',
          display: 'flex',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              padding: '16px 24px',
              background: activeTab === 'map' ? '#3b82f6' : 'transparent',
              color: activeTab === 'map' ? 'white' : '#6b7280',
              border: 'none',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              borderRight: '1px solid #e1e5e9',
              transition: 'all 0.2s',
            }}
          >
            🗺️ Mapa de NAPs
          </button>
          {canValidate && (
            <button
              onClick={() => setActiveTab('validation')}
              style={{
                padding: '16px 24px',
                background: activeTab === 'validation' ? '#3b82f6' : 'transparent',
                color: activeTab === 'validation' ? 'white' : '#6b7280',
                border: 'none',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              ✅ Panel de Validación
              {napCounts.pendiente > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#FFA500',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}>
                  {napCounts.pendiente}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'map' ? (
          <>
            {/* Map Filters */}
            <Suspense fallback={<LoadingSpinner message="Cargando filtros..." size="small" />}>
              <MapFilters
                currentFilter={filterState}
                onFilterChange={setFilterState}
                napCounts={napCounts}
                onSearch={setSearchQuery}
              />
            </Suspense>

            {/* Map Container */}
            <div style={{
              background: 'white',
              borderRadius: '0 0 8px 8px',
              border: '1px solid #e1e5e9',
              borderTop: 'none',
              overflow: 'hidden',
              height: '600px',
            }}>
              <Suspense fallback={<LoadingSpinner message="Cargando mapa..." />}>
                <MapView
                  naps={filteredNaps}
                  onMarkerClick={handleMarkerClick}
                  filterState={filterState}
                />
              </Suspense>
            </div>
          </>
        ) : (
          <div style={{
            borderRadius: '0 0 8px 8px',
            border: '1px solid #e1e5e9',
            borderTop: 'none',
            overflow: 'hidden',
          }}>
            <Suspense fallback={<LoadingSpinner message="Cargando panel de validación..." />}>
              <ValidationPanel
                naps={filteredNaps}
                onValidate={handleValidateNap}
                onRefresh={refreshNaps}
              />
            </Suspense>
          </div>
        )}

        {/* Refresh Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
        }}>
          <button
            onClick={refreshNaps}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            🔄 Actualizar Datos
          </button>
        </div>
      </main>

      {/* NAP Details Modal */}
      {selectedNap && (
        <Suspense fallback={<LoadingSpinner message="Cargando detalles..." />}>
          <NapDetails
            nap={selectedNap}
            onClose={() => setSelectedNap(null)}
            canValidate={canValidate}
            onValidate={handleValidateNap}
          />
        </Suspense>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;