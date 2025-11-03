import { Request, Response } from 'express';
import { GoogleAuthService } from '../services/googleAuth';
import { UserService } from '../services/userService';
import { JWTService } from '../services/jwtService';
import { AuthRequest } from '../types/auth';

const googleAuthService = new GoogleAuthService();
const userService = new UserService();
const jwtService = new JWTService();

export class AuthController {
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { token, accessToken } = req.body;

      if (!token && !accessToken) {
        res.status(400).json({ 
          error: 'Token de Google requerido (token o accessToken)' 
        });
        return;
      }

      let googleUserInfo;
      
      if (token) {
        // ID Token verification
        googleUserInfo = await googleAuthService.verifyToken(token);
      } else {
        // Access Token verification
        googleUserInfo = await googleAuthService.getTokenInfo(accessToken);
      }

      const user = await userService.findOrCreateUser(googleUserInfo);
      const jwtToken = jwtService.generateToken(user);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: user.lastLogin,
        },
        token: jwtToken,
      });
    } catch (error) {
      console.error('Google auth error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('no autorizado')) {
          res.status(403).json({ error: error.message });
          return;
        }
        if (error.message.includes('Invalid')) {
          res.status(401).json({ error: 'Token de Google inválido' });
          return;
        }
      }

      res.status(500).json({ 
        error: 'Error interno del servidor durante la autenticación' 
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          lastLogin: req.user.lastLogin,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Error al obtener el perfil del usuario' 
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token. Here we just confirm the logout.
      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Error al cerrar sesión' 
      });
    }
  }

  // Admin endpoint to add authorized users
  async addAuthorizedUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, name, role } = req.body as { 
        email: string; 
        name: string; 
        role: 'tecnico_campo' | 'tecnico_validador' | 'administrador' 
      };

      if (!email || !name || !role) {
        res.status(400).json({ 
          error: 'Email, nombre y rol son requeridos' 
        });
        return;
      }

      const validRoles: Array<'tecnico_campo' | 'tecnico_validador' | 'administrador'> = [
        'tecnico_campo', 
        'tecnico_validador', 
        'administrador'
      ];
      if (!validRoles.includes(role)) {
        res.status(400).json({ 
          error: 'Rol inválido. Debe ser: tecnico_campo, tecnico_validador o administrador' 
        });
        return;
      }

      await userService.addAuthorizedUser(email, name, role);

      res.json({ 
        message: 'Usuario autorizado agregado exitosamente',
        user: { email, name, role }
      });
    } catch (error) {
      console.error('Add authorized user error:', error);
      res.status(500).json({ 
        error: 'Error al agregar usuario autorizado' 
      });
    }
  }

  async getAuthorizedUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = userService.getAuthorizedUsers();
      res.json({ users });
    } catch (error) {
      console.error('Get authorized users error:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuarios autorizados' 
      });
    }
  }
}