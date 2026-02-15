import { Router } from 'express';
import { getCustomers, createCustomer, getCustomerById } from '../controllers/customerController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);

export default router;
