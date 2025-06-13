import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Password Utility
 * Handles password hashing, comparison and token generation
 */
export class PasswordUtil {
  /**
   * Hash a password
   * @param password Plain text password
   * @param saltRounds Number of salt rounds (default: 10)
   */
  static async hash(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hash
   * @param password Plain text password
   * @param hash Hashed password
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a random token
   * @param size Token size in bytes (default: 32)
   */
  static generateToken(size: number = 32): string {
    return crypto.randomBytes(size).toString('hex');
  }

  /**
   * Generate a random password
   * @param length Password length (default: 12)
   */
  static generateRandomPassword(length: number = 12): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    // Ensure at least one of each character type
    let password = '';
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }
}