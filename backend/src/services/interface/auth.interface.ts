import { UserRole } from '@/middleware/role';

export interface AuthResponse {
  user: {
    id: string;
    username: {
      firstname: string;
      lastname: string;
    };
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}