export type Role = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
