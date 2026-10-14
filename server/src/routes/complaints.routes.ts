import { Router } from 'express';
import { getComplaints, createComplaint, updateComplaint } from '../controllers/complaints.controller';
import { requireAuth, requireApprovedUser } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);
router.use(requireApprovedUser);

router.get('/', getComplaints);
router.post('/', upload.single('photo'), createComplaint);
router.patch('/:id', upload.single('resolutionPhoto'), updateComplaint);

export default router;
