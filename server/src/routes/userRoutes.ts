import { Router } from 'express';
import { getUsers, createUser, getRoles } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', requireRole(['Admin']), getUsers);
router.post('/', requireRole(['Admin']), createUser);
router.get('/roles', requireRole(['Admin']), getRoles);

export default router;
