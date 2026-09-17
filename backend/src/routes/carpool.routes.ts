import { Router } from 'express';
import {
  acceptCarpoolMatch,
  createCarpoolRequest,
  getCarpoolMatches,
} from '../controllers/carpool.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/request', createCarpoolRequest);
router.get('/matches', getCarpoolMatches);
router.post('/:id/accept', acceptCarpoolMatch);

export default router;
