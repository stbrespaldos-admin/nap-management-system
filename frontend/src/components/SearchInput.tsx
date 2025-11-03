import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  style?: React.CSSProperties;
  clearOnSearch?: boolean;
  showClearButton?: boolean;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
  className,
  style,
  clearOnSearch = false,
  showClearButton = true,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, debounceMs);

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
    
    if (clearOnSearch && debouncedQuery) {
      setQuery('');
    }
  }, [debouncedQuery, onSearch, clearOnSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    ...style
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    paddingRight: showClearButton && query ? '36px' : '12px',
    border: `2px solid ${isFocused ? '#3b82f6' : '#e1e5e9'}`,
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled ? '#f8f9fa' : 'white',
    color: disabled ? '#6b7280' : '#1f2937',
    cursor: disabled ? 'not-allowed' : 'text'
  };

  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '16px',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    transition: 'color 0.2s ease, background-color 0.2s ease'
  };

  return (
    <div style={containerStyle} className={className}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={inputStyle}
        disabled={disabled}
      />
      
      {showClearButton && query && !disabled && (
        <button
          onClick={handleClear}
          style={clearButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchInput;