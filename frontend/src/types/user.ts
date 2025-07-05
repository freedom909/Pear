// 与后端一致的UserRole枚举
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// 与后端一致的User接口
export interface User {
  id: string;
  name?: string;
  username?: {
    firstname: string;
    lastname: string;
  };
  email?: string;
  phone?: string;
  idNumber?: string;
  token?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  role: UserRole;
  permissions?: string[];
  avatar?: string;
  provider?: string;
  isVerified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}