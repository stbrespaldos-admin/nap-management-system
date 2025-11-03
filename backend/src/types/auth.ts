export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tecnico_campo' | 'tecnico_validador' | 'administrador';
  googleId: string;
  lastLogin: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}