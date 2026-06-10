import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export class HashUtil {
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static sha256WithSalt(data: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
  }

  static async bcryptHash(plainText: string, rounds: number = 12): Promise<string> {
    return bcrypt.hash(plainText, rounds);
  }

  static async bcryptCompare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateNumericCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }
}
