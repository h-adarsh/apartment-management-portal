import { Router } from 'express';
import {
  getConfig,
  updateConfig,
  getDues,
  generateMonthlyDuesBatch,
  submitPayment,
  verifyPayment,
  downloadReceipt,
  getExpenses,
  createExpense,
  deleteExpense,
  getFinancialSummary
} from '../controllers/finance.controller';
import { requireAuth, requireRole, requireApprovedUser } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '@prisma/client';

const router = Router();

// Enforce both authentication and approved resident status for all finance endpoints
router.use(requireAuth);
router.use(requireApprovedUser);

// Configuration
router.get('/config', getConfig);
router.patch('/config', requireRole([Role.ADMIN]), updateConfig);

// Dues & Batches
router.get('/dues', getDues);
router.post('/dues/generate', requireRole([Role.ADMIN]), generateMonthlyDuesBatch);

// Payments & Receipts
router.post('/payments/submit', upload.single('proofImage'), submitPayment);
router.patch('/payments/:paymentId/verify', requireRole([Role.ADMIN]), verifyPayment);
router.get('/receipts/:receiptNumber', downloadReceipt);

// Expenses (All approved residents can view, only Admin can create/delete)
router.get('/expenses', getExpenses);
router.post('/expenses', requireRole([Role.ADMIN]), upload.single('billImage'), createExpense);
router.delete('/expenses/:id', requireRole([Role.ADMIN]), deleteExpense);

// High-level summary
router.get('/summary', getFinancialSummary);

export default router;

