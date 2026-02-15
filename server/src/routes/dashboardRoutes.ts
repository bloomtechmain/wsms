import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect dashboard route, allow Admin, Manager, Reader (maybe just View)
router.get('/summary', authenticateToken, requireRole(['Admin', 'Manager', 'Reader']), getDashboardStats);

export default router;
