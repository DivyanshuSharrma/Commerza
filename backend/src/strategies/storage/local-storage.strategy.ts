import { StorageStrategy } from '../../core/interfaces/storage-strategy.interface';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
  readonly deliveryMode = 'STREAM' as const;
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    fsPromises.mkdir(this.uploadDir, { recursive: true }).catch(() => {});
  }

  async uploadFile(file: Buffer, filePath: string, mimeType: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, filePath);
    const parentDir = path.dirname(fullPath);
    await fsPromises.mkdir(parentDir, { recursive: true });
    await fsPromises.writeFile(fullPath, file);
    return filePath;
  }

  async getSignedUrl(filePath: string, expirySeconds = 3600): Promise<string> {
    // Returns local storage API path
    return `/api/storage/local/${filePath}`;
  }

  async downloadStream(filePath: string): Promise<Readable> {
    const fullPath = path.join(this.uploadDir, filePath);
    
    // Path traversal check
    const relative = path.relative(this.uploadDir, fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Path traversal detected');
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.createReadStream(fullPath);
  }
}
