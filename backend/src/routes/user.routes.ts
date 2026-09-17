import { Router } from 'express';
import {
  getPreferences,
  getProfile,
  updatePreferences,
  updateProfile,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

export default router;
