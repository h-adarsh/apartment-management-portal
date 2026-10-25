import { Router } from 'express';
import {
  login,
  register,
  logout,
  getCurrentUser,
  getDemoAccounts,
  getBuildingUnits,
  getPendingRegistrations,
  reviewRegistration,
  updateProfile,
  changePassword
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);
router.get('/demo-accounts', getDemoAccounts);
router.get('/building-units', getBuildingUnits);

// Admin-only approval routes
router.get('/admin/pending-registrations', requireAuth, getPendingRegistrations);
router.post('/admin/registrations/:userId/review', requireAuth, reviewRegistration);

export default router;
