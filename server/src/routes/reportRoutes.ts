import express from 'express';
import { getRevenueReport, getUsageReport, getCustomerSummaryReport } from '../controllers/reportController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// All reports require Admin role
router.get('/revenue', authenticateToken, requireRole(['Admin']), getRevenueReport);
router.get('/usage', authenticateToken, requireRole(['Admin']), getUsageReport);
router.get('/customer-summary', authenticateToken, requireRole(['Admin']), getCustomerSummaryReport);

export default router;
