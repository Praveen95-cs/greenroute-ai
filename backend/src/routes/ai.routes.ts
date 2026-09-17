import { Router } from 'express';
import { mobilityQuery } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.post('/mobility-query', mobilityQuery);

export default router;
