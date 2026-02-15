import { Router } from 'express';
import { addReading, getReadings, updateReading } from '../controllers/readingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/', addReading);
router.get('/', getReadings);
router.put('/:id', updateReading);

export default router;
