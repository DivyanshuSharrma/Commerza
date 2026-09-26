import { Readable } from 'stream';

export interface StorageStrategy {
  readonly deliveryMode: 'REDIRECT' | 'STREAM';
  uploadFile(file: Buffer, path: string, mimeType: string, context?: any): Promise<string>;
  getSignedUrl(path: string, expirySeconds?: number, context?: any): Promise<string>;
  downloadStream(path: string, context?: any): Promise<Readable>;
}
