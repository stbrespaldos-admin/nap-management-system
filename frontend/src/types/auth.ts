export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tecnico_campo' | 'tecnico_validador' | 'administrador';
  lastLogin: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}