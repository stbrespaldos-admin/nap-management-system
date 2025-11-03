import { Router } from 'express';
import { NapsController } from '../controllers/napsController';
import { authenticateToken } from '../middleware/auth';
import { validateNapData, validateNapValidation } from '../middleware/validation';

const router = Router();

// Public routes (read-only access to NAPs data)
router.get('/health', NapsController.getHealthStatus);
router.get('/', NapsController.getAllNaps);
router.get('/pending', NapsController.getPendingNaps);
router.get('/:id', NapsController.getNapById);

// Webhook endpoint for real-time updates
router.post('/webhook', NapsController.handleWebhook);

// Protected routes (require authentication)
router.put('/:id/validate', authenticateToken, validateNapValidation, NapsController.validateNap);
router.post('/', authenticateToken, validateNapData, NapsController.addNap);

export default router;