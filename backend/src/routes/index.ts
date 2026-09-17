import { Router } from 'express';
import aiRoutes from './ai.routes';
import authRoutes from './auth.routes';
import carpoolRoutes from './carpool.routes';
import healthRoutes from './health.routes';
import routeRoutes from './route.routes';
import userRoutes from './user.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/ai', aiRoutes);
router.use('/carpool', carpoolRoutes);

export default router;
