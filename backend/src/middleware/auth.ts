import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';
import { UserService } from '../services/userService';
import { AuthRequest } from '../types/auth';

const jwtService = new JWTService();
const userService = new UserService();

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Token de acceso requerido' });
      return;
    }

    const decoded = jwtService.verifyToken(token);
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRole = (
  allowedRoles: Array<'tecnico_campo' | 'tecnico_validador' | 'administrador'>
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso' 
      });
      return;
    }

    next();
  };
};

export const requireValidatorRole = requireRole(['tecnico_validador', 'administrador']);
export const requireAdminRole = requireRole(['administrador']);