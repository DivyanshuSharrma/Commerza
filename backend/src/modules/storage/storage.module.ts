import { Global, Module } from '@nestjs/common';
import { LocalStorageStrategy } from '../../strategies/storage/local-storage.strategy';
import { S3StorageStrategy } from '../../strategies/storage/s3-storage.strategy';
import { StorageFactory } from '../../providers/storage/storage.factory';
import { UploadsController } from './uploads.controller';

@Global()
@Module({
  controllers: [UploadsController],
  providers: [
    LocalStorageStrategy,
    S3StorageStrategy,
    StorageFactory,
  ],
  exports: [
    StorageFactory,
  ],
})
export class StorageModule {}
