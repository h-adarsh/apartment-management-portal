import { Router } from 'express';
import { getAllFlats, getFlatById, updateFlat } from '../controllers/flats.controller';
import { requireAuth, requireRole, requireApprovedUser } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);
router.use(requireApprovedUser);

router.get('/', getAllFlats);
router.get('/:id', getFlatById);
router.patch('/:id', requireRole([Role.ADMIN]), updateFlat);

export default router;
