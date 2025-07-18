import { UserDocument, UserRole } from '../models/user/user.types';

export function createMockUser(overrides = {}): UserDocument {
  return {
    _id: 'mock-user-id',
    id: 'mock-user-id',
    email: 'test@example.com',
    username: 'Test User',
    password: 'hashed-password',
    role: 'user' as UserRole,
    resetPasswordToken: undefined,
    resetPasswordExpiresIn: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,

    comparePassword: jest.fn().mockResolvedValue(true),
    getResetPasswordToken: jest.fn().mockReturnValue('mock-reset-token'),
    clearResetToken: jest.fn(),
    getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt'),
    generateAuthToken: jest.fn().mockReturnValue('mock-auth-token'),
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),

    save: jest.fn().mockResolvedValue({} as UserDocument),

    // You can override anything if needed
    ...overrides,
  } as unknown as UserDocument;
}
