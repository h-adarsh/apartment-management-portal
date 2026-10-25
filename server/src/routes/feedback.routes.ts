import { Router } from 'express';
import { submitFeedback, getFeedbacks, deleteFeedback } from '../controllers/feedback.controller';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public / Tester submission (authenticated or unauthenticated)
router.post('/', optionalAuth, submitFeedback);

// Admin feedback review & metrics
router.get('/', requireAuth, requireRole([Role.ADMIN]), getFeedbacks);
router.delete('/:id', requireAuth, requireRole([Role.ADMIN]), deleteFeedback);

export default router;
