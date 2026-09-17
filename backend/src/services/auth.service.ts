import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AuthTokens, AuthUser } from '../types/auth.types';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { signAccessToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

function toAuthUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function createTokens(user: { id: string; email: string; role: Role }): AuthTokens {
  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        preferences: {
          create: {},
        },
      },
    });

    return {
      user: toAuthUser(user),
      tokens: createTokens(user),
    };
  },

  async login(input: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      user: toAuthUser(user),
      tokens: createTokens(user),
    };
  },

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }
    return toAuthUser(user);
  },
};
