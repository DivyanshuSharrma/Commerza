import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly prefix = 'enc:v1:';
  private readonly key: Buffer;

  constructor() {
    const rawKey =
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'commerza_vault_default_secret_key_32_bytes!';
    // Ensure deterministic 32-byte (256-bit) buffer via SHA-256
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Determine if a setting key holds sensitive credentials that require encryption at rest.
   */
  isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase();
    const sensitivePatterns = [
      'secret',
      'password',
      'private_key',
      'api_key',
      'token',
      'credential',
      'webhook_secret',
      'access_key',
      'auth',
    ];
    return sensitivePatterns.some((pattern) => normalized.includes(pattern));
  }

  /**
   * Check if a string is already encrypted in the enc:v1: format.
   */
  isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith(this.prefix);
  }

  /**
   * Encrypt plaintext into enc:v1:<iv_hex>:<authTag_hex>:<cipher_hex>
   */
  encrypt(plaintext: string): string {
    if (!plaintext || typeof plaintext !== 'string') return plaintext;
    if (this.isEncrypted(plaintext)) return plaintext;

    try {
      const iv = crypto.randomBytes(12); // Recommended 96-bit IV for AES-GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');

      return `${this.prefix}${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err: any) {
      this.logger.error(`Encryption failed: ${err.message}`);
      throw new Error(`Data encryption error: ${err.message}`);
    }
  }

  /**
   * Decrypt enc:v1:<iv_hex>:<authTag_hex>:<cipher_hex> back to plaintext.
   * If not encrypted, returns value as-is for safe backward compatibility.
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    if (!this.isEncrypted(ciphertext)) return ciphertext;

    try {
      const parts = ciphertext.slice(this.prefix.length).split(':');
      if (parts.length !== 3) {
        throw new Error('Malformed encrypted payload structure');
      }
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err: any) {
      this.logger.error(`Decryption failed: ${err.message}`);
      // Fallback returning original to prevent application bricking if key changed
      return ciphertext;
    }
  }

  /**
   * Mask sensitive string for safe UI presentation (e.g. "sk_live_••••••7c3a")
   */
  mask(value: string): string {
    if (!value || typeof value !== 'string') return '';
    const decrypted = this.decrypt(value);
    if (decrypted.length <= 6) return '••••••';
    const start = decrypted.slice(0, 4);
    const end = decrypted.slice(-4);
    return `${start}••••••••${end}`;
  }
}
