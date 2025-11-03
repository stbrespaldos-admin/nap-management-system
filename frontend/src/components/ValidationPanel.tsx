import React, { useState, useMemo } from 'react';
import { NAP } from '../types/nap';
import { useAuth } from './AuthProvider';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { notificationService } from '../services/notificationService';

interface ValidationPanelProps {
  naps: NAP[];
  onValidate: (napId: string, validationData: { status: NAP['status']; comments?: string }) => Promise<void>;
  onRefresh: () => void;
}

interface ValidationFormData {
  status: 'validado' | 'rechazado';
  comments: string;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ naps, onValidate, onRefresh }) => {
  const { user } = useAuth();
  const [selectedNap, setSelectedNap] = useState<NAP | null>(null);
  const [validationForm, setValidationForm] = useState<ValidationFormData>({
    status: 'validado',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<NAP['status'] | 'all'>('pendiente');
  const [filterDate, setFilterDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'municipality' | 'sector'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Check if user can validate
  const canValidate = user?.role === 'tecnico_validador' || user?.role === 'administrador';

  // Filter and sort NAPs
  const filteredAndSortedNaps = useMemo(() => {
    let filtered = naps;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(nap => nap.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter(nap => {
        const napDate = new Date(nap.registrationDate);
        return napDate.toDateString() === filterDateObj.toDateString();
      });
    }

    // Sort NAPs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.registrationDate.getTime() - b.registrationDate.getTime();
          break;
        case 'municipality':
          comparison = a.municipality.localeCompare(b.municipality);
          break;
        case 'sector':
          comparison = a.sector.localeCompare(b.sector);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [naps, filterStatus, filterDate, sortBy, sortOrder]);

  // Get pending NAPs count
  const pendingCount = naps.filter(nap => nap.status === 'pendiente').length;

  const { handleError } = useErrorHandler();

  const handleValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNap || !canValidate) return;

    setIsSubmitting(true);
    const loadingToast = notificationService.loading('Validando NAP...');
    
    try {
      await onValidate(selectedNap.id, {
        status: validationForm.status,
        comments: validationForm.comments.trim() || undefined
      });
      
      // Reset form and close modal
      setSelectedNap(null);
      setValidationForm({ status: 'validado', comments: '' });
      
      // Show success message
      notificationService.update(
        loadingToast, 
        `NAP ${validationForm.status === 'validado' ? 'validado' : 'rechazado'} exitosamente`,
        'success'
      );
    } catch (error) {
      notificationService.dismiss(loadingToast);
      handleError(error, 'Validación de NAP', {
        showNotification: true,
        onError: () => {
          // Additional error handling if needed
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: NAP['status']) => {
    switch (status) {
      case 'pendiente': return '#FFA500';
      case 'en_construccion': return '#1E90FF';
      case 'activo': return '#32CD32';
      case 'validado': return '#008000';
      case 'rechazado': return '#DC143C';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: NAP['status']) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_construccion': return 'En Construcción';
      case 'activo': return 'Activo';
      case 'validado': return 'Validado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };

  if (!canValidate) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Acceso Restringido</h3>
        <p style={{ margin: 0 }}>
          Solo los técnicos validadores y administradores pueden acceder al panel de validación.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e1e5e9',
        background: '#f8f9fa'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '20px',
            fontWeight: 600
          }}>
            Panel de Validación
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: '#FFA500',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {pendingCount} pendientes
            </span>
            <button
              onClick={onRefresh}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '4px'
            }}>
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as NAP['status'] | 'all')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_construccion">En Construcción</option>
              <option value="activo">Activo</option>
              <option value="validado">Validado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '4px'
            }}>
              Fecha de Registro
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '4px'
            }}>
              Ordenar por
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'date' | 'municipality' | 'sector');
                setSortOrder(order as 'asc' | 'desc');
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="date-desc">Fecha (más reciente)</option>
              <option value="date-asc">Fecha (más antigua)</option>
              <option value="municipality-asc">Municipio (A-Z)</option>
              <option value="municipality-desc">Municipio (Z-A)</option>
              <option value="sector-asc">Sector (A-Z)</option>
              <option value="sector-desc">Sector (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* NAPs List */}
      <div style={{
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {filteredAndSortedNaps.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No hay NAPs</h3>
            <p style={{ margin: 0 }}>
              No se encontraron NAPs con los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredAndSortedNaps.map((nap) => (
            <div
              key={nap.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e1e5e9',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              onClick={() => setSelectedNap(nap)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: getStatusColor(nap.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {getStatusLabel(nap.status)}
                  </span>
                  <span style={{
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    NAP-{nap.id.slice(-6)}
                  </span>
                </div>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {formatDate(nap.registrationDate)}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <div>
                  <strong>Municipio:</strong> {nap.municipality}
                </div>
                <div>
                  <strong>Sector:</strong> {nap.sector}
                </div>
                <div>
                  <strong>Registrado por:</strong> {nap.registeredBy}
                </div>
                <div>
                  <strong>Coordenadas:</strong> {nap.coordinates.latitude.toFixed(6)}, {nap.coordinates.longitude.toFixed(6)}
                </div>
              </div>

              {nap.observations && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <strong>Observaciones:</strong> {nap.observations}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Validation Modal */}
      {selectedNap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: 600
              }}>
                Validar NAP-{selectedNap.id.slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedNap(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* NAP Details */}
            <div style={{ padding: '20px' }}>
              <div style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>Estado actual:</strong>
                    <span style={{
                      marginLeft: '8px',
                      background: getStatusColor(selectedNap.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusLabel(selectedNap.status)}
                    </span>
                  </div>
                  <div>
                    <strong>Municipio:</strong> {selectedNap.municipality}
                  </div>
                  <div>
                    <strong>Sector:</strong> {selectedNap.sector}
                  </div>
                  <div>
                    <strong>Registrado por:</strong> {selectedNap.registeredBy}
                  </div>
                  <div>
                    <strong>Fecha de registro:</strong> {formatDate(selectedNap.registrationDate)}
                  </div>
                  <div>
                    <strong>Coordenadas:</strong> {selectedNap.coordinates.latitude.toFixed(6)}, {selectedNap.coordinates.longitude.toFixed(6)}
                  </div>
                </div>

                {selectedNap.observations && (
                  <div style={{ marginTop: '12px' }}>
                    <strong>Observaciones:</strong>
                    <div style={{
                      marginTop: '4px',
                      padding: '8px',
                      background: 'white',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {selectedNap.observations}
                    </div>
                  </div>
                )}

                {selectedNap.validationComments && (
                  <div style={{ marginTop: '12px' }}>
                    <strong>Comentarios de validación anteriores:</strong>
                    <div style={{
                      marginTop: '4px',
                      padding: '8px',
                      background: 'white',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {selectedNap.validationComments}
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Form */}
              <form onSubmit={handleValidationSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Resultado de la validación *
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '16px'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="validationStatus"
                        value="validado"
                        checked={validationForm.status === 'validado'}
                        onChange={(e) => setValidationForm(prev => ({
                          ...prev,
                          status: e.target.value as 'validado' | 'rechazado'
                        }))}
                      />
                      <span style={{ color: '#008000', fontWeight: 500 }}>✓ Validado</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="validationStatus"
                        value="rechazado"
                        checked={validationForm.status === 'rechazado'}
                        onChange={(e) => setValidationForm(prev => ({
                          ...prev,
                          status: e.target.value as 'validado' | 'rechazado'
                        }))}
                      />
                      <span style={{ color: '#DC143C', fontWeight: 500 }}>✗ Rechazado</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Comentarios {validationForm.status === 'rechazado' ? '*' : '(opcional)'}
                  </label>
                  <textarea
                    value={validationForm.comments}
                    onChange={(e) => setValidationForm(prev => ({
                      ...prev,
                      comments: e.target.value
                    }))}
                    placeholder={
                      validationForm.status === 'validado'
                        ? 'Comentarios adicionales sobre la validación...'
                        : 'Explique las razones del rechazo...'
                    }
                    required={validationForm.status === 'rechazado'}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => setSelectedNap(null)}
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 20px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (validationForm.status === 'rechazado' && !validationForm.comments.trim())}
                    style={{
                      padding: '10px 20px',
                      background: validationForm.status === 'validado' ? '#008000' : '#DC143C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || (validationForm.status === 'rechazado' && !validationForm.comments.trim()) ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? 'Procesando...' : (validationForm.status === 'validado' ? '✓ Validar NAP' : '✗ Rechazar NAP')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;