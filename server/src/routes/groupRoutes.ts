import { Router } from 'express';
import { getGroups, createGroup } from '../controllers/groupController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getGroups); // All authenticated users can view groups? Or restrict?
router.post('/', requireRole(['Admin', 'Management']), createGroup);

export default router;
