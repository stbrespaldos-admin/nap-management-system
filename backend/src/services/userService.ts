import { User, GoogleUserInfo } from '../types/auth';

// In a real application, this would be stored in a database
// For now, we'll use a simple in-memory store with predefined users
const authorizedUsers: Record<string, Omit<User, 'id' | 'lastLogin'>> = {
  // Add authorized users here - in production this would come from a database
  // Example:
  // 'user@example.com': {
  //   email: 'user@example.com',
  //   name: 'User Name',
  //   role: 'tecnico_validador',
  //   googleId: 'google_user_id'
  // }
};

export class UserService {
  async findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<User> {
    const existingUser = authorizedUsers[googleUserInfo.email];
    
    if (!existingUser) {
      throw new Error('Usuario no autorizado para acceder al sistema');
    }

    // Verify the Google ID matches (for security)
    if (existingUser.googleId && existingUser.googleId !== googleUserInfo.id) {
      throw new Error('Credenciales de Google no coinciden');
    }

    // Create user object with current login time
    const user: User = {
      id: googleUserInfo.id,
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      role: existingUser.role,
      googleId: googleUserInfo.id,
      lastLogin: new Date(),
    };

    // Update the stored user with the Google ID if not set
    if (!existingUser.googleId) {
      authorizedUsers[googleUserInfo.email].googleId = googleUserInfo.id;
    }

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    // Find user by Google ID
    const userEntry = Object.entries(authorizedUsers).find(
      ([_, user]) => user.googleId === id
    );

    if (!userEntry) {
      return null;
    }

    const [email, userData] = userEntry;
    return {
      id,
      email,
      name: userData.name,
      role: userData.role,
      googleId: userData.googleId || id,
      lastLogin: new Date(), // In a real app, this would come from the database
    };
  }

  async addAuthorizedUser(
    email: string,
    name: string,
    role: 'tecnico_campo' | 'tecnico_validador' | 'administrador',
    googleId?: string
  ): Promise<void> {
    authorizedUsers[email] = {
      email,
      name,
      role,
      googleId: googleId || '',
    };
  }

  getAuthorizedUsers(): Record<string, Omit<User, 'id' | 'lastLogin'>> {
    return { ...authorizedUsers };
  }
}