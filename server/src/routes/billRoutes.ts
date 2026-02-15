import { Router } from 'express';
import { generateBill, getBills, updateBillStatus } from '../controllers/billController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/generate', generateBill);
router.get('/', getBills);
router.patch('/:id/status', requireRole(['Admin']), updateBillStatus);

export default router;
