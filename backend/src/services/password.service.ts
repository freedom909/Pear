import userService from './user.service';

export class PasswordService {
  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return null;
    }

    const token = user.passwordResetToken;
    await userService.updateUser(user.id as any, user as any);
    return token ?? null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await userService.getUserByResetToken(token);
    if (
      !user ||
      !user.resetPasswordExpiresIn ||
      new Date(user.resetPasswordExpiresIn()) < new Date()
    ) {
      throw new Error('Invalid or expired token');
    }

    user.password = newPassword;
    user.clearResetToken();
    await userService.updateUser(user.id as any, user as any);
    return true;
  }
}
