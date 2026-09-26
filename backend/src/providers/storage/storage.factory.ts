import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigContext } from '../../config/config.service';
import { StorageStrategy } from '../../core/interfaces/storage-strategy.interface';
import { LocalStorageStrategy } from '../../strategies/storage/local-storage.strategy';
import { S3StorageStrategy } from '../../strategies/storage/s3-storage.strategy';

@Injectable()
export class StorageFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageStrategy: LocalStorageStrategy,
    private readonly s3StorageStrategy: S3StorageStrategy,
  ) {}

  async getStrategy(context?: ConfigContext): Promise<StorageStrategy> {
    const provider = await this.configService.get('storage_provider', context, 'LOCAL');
    
    switch (provider.toUpperCase()) {
      case 'S3':
      case 'R2':
        return this.s3StorageStrategy;
      case 'LOCAL':
      default:
        return this.localStorageStrategy;
    }
  }
}
