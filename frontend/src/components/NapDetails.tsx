import React from 'react';
import { NAP } from '../types/nap';

interface NapDetailsProps {
  nap: NAP | null;
  onClose: () => void;
  canValidate?: boolean;
  onValidate?: (napId: string, validationData: { status: NAP['status']; comments?: string }) => void;
}

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_construccion: 'En Construcción',
  activo: 'Activo',
  validado: 'Validado',
  rechazado: 'Rechazado',
};

const STATUS_COLORS = {
  pendiente: '#FFA500',
  en_construccion: '#FFD700',
  activo: '#32CD32',
  validado: '#008000',
  rechazado: '#FF0000',
};

const NapDetails: React.FC<NapDetailsProps> = ({ nap, onClose, canValidate = false, onValidate }) => {
  const [isValidating, setIsValidating] = React.useState(false);
  const [validationComments, setValidationComments] = React.useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null);

  if (!nap) return null;

  const handleValidation = async (status: NAP['status']) => {
    if (!onValidate) return;

    setIsValidating(true);
    try {
      await onValidate(nap.id, {
        status,
        comments: validationComments.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error validating NAP:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
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
      padding: window.innerWidth <= 768 ? '10px' : '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: window.innerWidth <= 768 ? '8px' : '12px',
        padding: window.innerWidth <= 768 ? '16px' : '24px',
        maxWidth: window.innerWidth <= 768 ? '100%' : '600px',
        width: '100%',
        maxHeight: window.innerWidth <= 768 ? '95vh' : '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e1e5e9',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: '#1f2937',
          }}>
            NAP {nap.id}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            background: STATUS_COLORS[nap.status],
          }}>
            {STATUS_LABELS[nap.status]}
          </span>
        </div>

        {/* Basic Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              Municipio
            </label>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: 500,
            }}>
              {nap.municipality}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              Sector
            </label>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: 500,
            }}>
              {nap.sector}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              Coordenadas GPS
            </label>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              fontFamily: 'monospace',
              marginBottom: '4px',
            }}>
              {nap.coordinates.latitude.toFixed(6)}, {nap.coordinates.longitude.toFixed(6)}
            </div>
            <a
              href={`https://www.google.com/maps?q=${nap.coordinates.latitude},${nap.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#3b82f6',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dbeafe';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              🗺️ Ver en Google Maps
            </a>
          </div>
        </div>

        {/* Registration Information */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: 600,
            color: '#1f2937',
          }}>
            Información de Registro
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                marginBottom: '2px',
              }}>
                Registrado por
              </label>
              <div style={{ fontSize: '14px', color: '#1f2937' }}>
                {nap.registeredBy}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                marginBottom: '2px',
              }}>
                Fecha de registro
              </label>
              <div style={{ fontSize: '14px', color: '#1f2937' }}>
                {nap.registrationDate.toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Current Validation Information */}
        {(nap.validatedBy || nap.validationDate) && (
          <div style={{
            background: '#f0f9ff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e0f2fe',
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1f2937',
            }}>
              Validación Actual
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {nap.validatedBy && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: '2px',
                  }}>
                    Validado por
                  </label>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {nap.validatedBy}
                  </div>
                </div>
              )}

              {nap.validationDate && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: '2px',
                  }}>
                    Fecha de validación
                  </label>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {nap.validationDate.toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>

            {nap.validationComments && (
              <div style={{ marginTop: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  marginBottom: '4px',
                }}>
                  Comentarios de validación
                </label>
                <div style={{
                  fontSize: '14px',
                  color: '#1f2937',
                  fontStyle: 'italic',
                  background: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #e1e5e9',
                }}>
                  {nap.validationComments}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation History */}
        {nap.validationHistory && nap.validationHistory.length > 0 && (
          <div style={{
            background: '#fefce8',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #fde047',
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📋 Historial de Validaciones ({nap.validationHistory.length})
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {nap.validationHistory
                .sort((a, b) => new Date(b.validationDate).getTime() - new Date(a.validationDate).getTime())
                .map((validation, index) => (
                <div
                  key={validation.id}
                  style={{
                    background: 'white',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e1e5e9',
                    position: 'relative',
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'white',
                      background: validation.status === 'validado' ? '#10b981' : '#ef4444',
                    }}>
                      {validation.status === 'validado' ? '✓ Validado' : '✗ Rechazado'}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    marginBottom: validation.comments ? '8px' : '0',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px',
                      }}>
                        Validado por
                      </label>
                      <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>
                        {validation.validatedBy}
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px',
                      }}>
                        Fecha
                      </label>
                      <div style={{ fontSize: '13px', color: '#1f2937' }}>
                        {new Date(validation.validationDate).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {validation.comments && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}>
                        Comentarios
                      </label>
                      <div style={{
                        fontSize: '13px',
                        color: '#1f2937',
                        fontStyle: 'italic',
                        background: '#f8f9fa',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e1e5e9',
                      }}>
                        {validation.comments}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {nap.observations && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Observaciones
            </label>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              lineHeight: 1.5,
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e1e5e9',
            }}>
              {nap.observations}
            </div>
          </div>
        )}

        {/* Photos Gallery */}
        {nap.photos && nap.photos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              📷 Fotografías ({nap.photos.length})
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
            }}>
              {nap.photos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid #e1e5e9',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelectedPhotoIndex(index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '2px solid #3b82f6';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px solid #e1e5e9';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={photo}
                    alt={`NAP ${nap.id} - Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}>
                    {index + 1}/{nap.photos?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhotoIndex !== null && nap.photos && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <div style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Close button */}
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>

              {/* Navigation buttons */}
              {nap.photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : (nap.photos?.length || 1) - 1);
                    }}
                    style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex(selectedPhotoIndex < (nap.photos?.length || 1) - 1 ? selectedPhotoIndex + 1 : 0);
                    }}
                    style={{
                      position: 'absolute',
                      right: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Image */}
              <img
                src={nap.photos[selectedPhotoIndex]}
                alt={`NAP ${nap.id} - Foto ${selectedPhotoIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Photo info */}
              <div style={{
                marginTop: '16px',
                color: 'white',
                textAlign: 'center',
                fontSize: '14px',
              }}>
                Foto {selectedPhotoIndex + 1} de {nap.photos.length} - NAP {nap.id}
              </div>
            </div>
          </div>
        )}

        {/* Validation Actions */}
        {canValidate && nap.status === 'pendiente' && (
          <div style={{
            borderTop: '1px solid #e1e5e9',
            paddingTop: '20px',
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1f2937',
            }}>
              Validar NAP
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
              }}>
                Comentarios (opcional)
              </label>
              <textarea
                value={validationComments}
                onChange={(e) => setValidationComments(e.target.value)}
                placeholder="Agregar comentarios sobre la validación..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => handleValidation('validado')}
                disabled={isValidating}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isValidating ? 'not-allowed' : 'pointer',
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                {isValidating ? 'Validando...' : '✓ Validar'}
              </button>

              <button
                onClick={() => handleValidation('rechazado')}
                disabled={isValidating}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '10px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isValidating ? 'not-allowed' : 'pointer',
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                {isValidating ? 'Rechazando...' : '✗ Rechazar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NapDetails;