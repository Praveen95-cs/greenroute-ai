import { Request, Response } from 'express';
import { mobilityAssistantService } from '../services/ai/mobilityAssistant.service';
import { mobilityQuerySchema } from '../validators/ai.validator';

export async function mobilityQuery(req: Request, res: Response): Promise<void> {
  const input = mobilityQuerySchema.parse(req.body);

  const result = await mobilityAssistantService.processQuery(
    req.user!.id,
    input.query,
    input.defaultSourceLabel,
  );

  res.json({
    success: true,
    data: result,
  });
}
