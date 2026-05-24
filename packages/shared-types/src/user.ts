import { Role } from './roles';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
