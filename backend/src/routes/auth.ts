import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireAdminRole } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/google', authController.googleAuth.bind(authController));

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));

// Admin only routes
router.post('/users', 
  authenticateToken, 
  requireAdminRole, 
  authController.addAuthorizedUser.bind(authController)
);

router.get('/users', 
  authenticateToken, 
  requireAdminRole, 
  authController.getAuthorizedUsers.bind(authController)
);

export default router;