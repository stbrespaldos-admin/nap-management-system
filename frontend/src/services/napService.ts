import axios, { AxiosError, AxiosResponse } from 'axios';
import { NAP } from '../types/nap';
import { performanceMonitor } from '../utils/performanceMonitor';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Mismo dominio en producción
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const napApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
napApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
napApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'La solicitud ha tardado demasiado. Intenta de nuevo.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return Promise.reject(error);
    } else if (error.response?.status === 403) {
      error.message = 'No tienes permisos para realizar esta acción.';
    } else if (error.response?.status && error.response.status >= 500) {
      error.message = 'Error del servidor. Intenta de nuevo más tarde.';
    }

    return Promise.reject(error);
  }
);

// Retry wrapper for API calls
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status && 
          error.response.status >= 400 && 
          error.response.status < 500 && 
          error.response.status !== 429) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const napService = {
  // Get all NAPs
  getAllNaps: async (): Promise<NAP[]> => {
    return performanceMonitor.measure('api_get_all_naps', async () => {
      try {
        const response = await withRetry(() => napApi.get('/naps'));
        performanceMonitor.counter('api_success');
        return response.data.map((nap: any) => ({
          ...nap,
          registrationDate: new Date(nap.registrationDate),
          validationDate: nap.validationDate ? new Date(nap.validationDate) : undefined,
        }));
      } catch (error: any) {
        performanceMonitor.counter('api_error');
        console.error('Error fetching NAPs:', error);
        throw new Error(error.response?.data?.error?.message || 'Error al obtener los NAPs');
      }
    });
  },

  // Get NAP by ID
  getNapById: async (id: string): Promise<NAP> => {
    return performanceMonitor.measure('api_get_nap_by_id', async () => {
      try {
        const response = await withRetry(() => napApi.get(`/naps/${id}`));
        performanceMonitor.counter('api_success');
        return {
          ...response.data,
          registrationDate: new Date(response.data.registrationDate),
          validationDate: response.data.validationDate ? new Date(response.data.validationDate) : undefined,
        };
      } catch (error: any) {
        performanceMonitor.counter('api_error');
        console.error(`Error fetching NAP ${id}:`, error);
        throw new Error(error.response?.data?.error?.message || `Error al obtener el NAP ${id}`);
      }
    });
  },

  // Get pending NAPs
  getPendingNaps: async (): Promise<NAP[]> => {
    try {
      const response = await withRetry(() => napApi.get('/naps/pending'));
      return response.data.map((nap: any) => ({
        ...nap,
        registrationDate: new Date(nap.registrationDate),
        validationDate: nap.validationDate ? new Date(nap.validationDate) : undefined,
      }));
    } catch (error: any) {
      console.error('Error fetching pending NAPs:', error);
      throw new Error(error.response?.data?.error?.message || 'Error al obtener los NAPs pendientes');
    }
  },

  // Validate NAP
  validateNap: async (id: string, validationData: { status: NAP['status']; comments?: string }): Promise<NAP> => {
    try {
      const response = await withRetry(() => 
        napApi.put(`/naps/${id}/validate`, {
          status: validationData.status,
          validationComments: validationData.comments
        })
      );
      
      // The backend returns validation info, but we need to fetch the full NAP data
      if (response.data.success) {
        // Fetch the updated NAP data
        const updatedNap = await napService.getNapById(id);
        return updatedNap;
      } else {
        throw new Error(response.data.message || 'Failed to validate NAP');
      }
    } catch (error: any) {
      console.error(`Error validating NAP ${id}:`, error);
      throw new Error(error.response?.data?.error?.message || `Error al validar el NAP ${id}`);
    }
  },
};