import { Request, Response } from 'express';
import { carpoolService } from '../services/carpool/carpool.service';
import { carpoolRequestSchema } from '../validators/carpool.validator';

export async function createCarpoolRequest(req: Request, res: Response): Promise<void> {
  const input = carpoolRequestSchema.parse(req.body);
  const result = await carpoolService.createRequest(req.user!.id, input);

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function getCarpoolMatches(req: Request, res: Response): Promise<void> {
  const matches = await carpoolService.getMatches(req.user!.id);

  res.json({
    success: true,
    data: { matches },
  });
}

export async function acceptCarpoolMatch(req: Request, res: Response): Promise<void> {
  const match = await carpoolService.acceptMatch(req.params.id as string, req.user!.id);

  res.json({
    success: true,
    data: { match },
  });
}
