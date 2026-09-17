import { Router } from 'express';
import { geocodeLocations, getRoute, rankRoutes, searchRoutes } from '../controllers/route.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/search', searchRoutes);
router.get('/geocode', geocodeLocations);
router.post('/:id/rank', rankRoutes);
router.get('/:id', getRoute);

export default router;
