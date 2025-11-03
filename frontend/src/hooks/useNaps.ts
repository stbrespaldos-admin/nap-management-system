import { useState, useEffect, useCallback, useRef } from 'react';
import { NAP } from '../types/nap';
import { napService } from '../services/napService';
import { useErrorHandler } from './useErrorHandler';

export const useNaps = (enableRealTimeUpdates = false) => {
  const [naps, setNaps] = useState<NAP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { handleError } = useErrorHandler();

  const fetchNaps = useCallback(async (showErrorNotification = true) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNaps = await napService.getAllNaps();
      setNaps(fetchedNaps);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching NAPs';
      setError(errorMessage);
      
      handleError(err, 'Obtener NAPs', {
        showNotification: showErrorNotification,
        onError: () => {
          // Additional error handling if needed
        }
      });
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const validateNap = useCallback(async (id: string, validationData: { status: NAP['status']; comments?: string }) => {
    try {
      const updatedNap = await napService.validateNap(id, validationData);
      setNaps(prevNaps => 
        prevNaps.map(nap => nap.id === id ? updatedNap : nap)
      );
      return updatedNap;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validating NAP';
      setError(errorMessage);
      
      // Don't show notification here as it's handled by the calling component
      handleError(err, 'Validar NAP', {
        showNotification: false
      });
      
      throw err;
    }
  }, [handleError]);

  const refreshNaps = useCallback(() => {
    fetchNaps();
  }, [fetchNaps]);

  useEffect(() => {
    fetchNaps();

    // Set up real-time updates if enabled
    if (enableRealTimeUpdates) {
      intervalRef.current = setInterval(() => {
        fetchNaps(false); // Don't show error notifications for background updates
      }, 30000); // Refresh every 30 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNaps, enableRealTimeUpdates]);

  return {
    naps,
    loading,
    error,
    validateNap,
    refreshNaps,
  };
};