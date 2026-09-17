import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { updatePreferencesSchema, updateProfileSchema } from '../validators/user.validator';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const profile = await userService.getProfile(req.user!.id);

  res.json({
    success: true,
    data: { profile },
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const input = updateProfileSchema.parse(req.body);
  const profile = await userService.updateProfile(req.user!.id, input);

  res.json({
    success: true,
    data: { profile },
  });
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const preferences = await userService.getPreferences(req.user!.id);

  res.json({
    success: true,
    data: { preferences },
  });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const input = updatePreferencesSchema.parse(req.body);
  const preferences = await userService.updatePreferences(req.user!.id, input);

  res.json({
    success: true,
    data: { preferences },
  });
}
