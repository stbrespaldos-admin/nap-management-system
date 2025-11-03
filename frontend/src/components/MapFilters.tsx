import React from 'react';
import { NAP } from '../types/nap';
import SearchInput from './SearchInput';

interface MapFiltersProps {
  currentFilter: NAP['status'] | 'all';
  onFilterChange: (filter: NAP['status'] | 'all') => void;
  napCounts: Record<NAP['status'] | 'all', number>;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const STATUS_LABELS = {
  all: 'Todos',
  pendiente: 'Pendientes',
  en_construccion: 'En Construcción',
  activo: 'Activos',
  validado: 'Validados',
  rechazado: 'Rechazados',
};

const STATUS_COLORS = {
  all: '#6b7280',
  pendiente: '#FFA500',
  en_construccion: '#FFD700',
  activo: '#32CD32',
  validado: '#008000',
  rechazado: '#FF0000',
};

const MapFilters: React.FC<MapFiltersProps> = ({ 
  currentFilter, 
  onFilterChange, 
  napCounts, 
  onSearch,
  searchPlaceholder = 'Buscar NAPs por ID, municipio, sector...'
}) => {
  const filterOptions: (NAP['status'] | 'all')[] = [
    'all',
    'pendiente',
    'en_construccion',
    'activo',
    'validado',
    'rechazado',
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      marginBottom: '16px',
      overflow: 'hidden',
    }}>
      {/* Search Section */}
      {onSearch && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e1e5e9',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px',
          }}>
            Buscar NAPs:
          </div>
          <SearchInput
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            debounceMs={300}
            style={{ maxWidth: '400px' }}
          />
        </div>
      )}

      {/* Filter Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '16px',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          marginRight: '8px',
        }}>
          Filtrar por estado:
        </div>
      
      {filterOptions.map(filter => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            border: currentFilter === filter ? `2px solid ${STATUS_COLORS[filter]}` : '1px solid #e1e5e9',
            borderRadius: '20px',
            background: currentFilter === filter ? `${STATUS_COLORS[filter]}15` : 'white',
            color: currentFilter === filter ? STATUS_COLORS[filter] : '#6b7280',
            fontSize: '12px',
            fontWeight: currentFilter === filter ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (currentFilter !== filter) {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = STATUS_COLORS[filter];
            }
          }}
          onMouseLeave={(e) => {
            if (currentFilter !== filter) {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e1e5e9';
            }
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: STATUS_COLORS[filter],
            }}
          />
          <span>{STATUS_LABELS[filter]}</span>
          <span style={{
            background: currentFilter === filter ? STATUS_COLORS[filter] : '#e1e5e9',
            color: currentFilter === filter ? 'white' : '#6b7280',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 600,
            minWidth: '16px',
            textAlign: 'center',
          }}>
            {napCounts[filter] || 0}
          </span>
        </button>
      ))}
      </div>
    </div>
  );
};

export default MapFilters;