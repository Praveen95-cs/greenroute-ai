import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);

  res.json({
    success: true,
    data: result,
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.user!.id);

  res.json({
    success: true,
    data: { user },
  });
}
