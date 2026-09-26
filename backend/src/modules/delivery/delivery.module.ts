import { Global, Module } from '@nestjs/common';
import { InternalFileDeliveryStrategy } from '../../strategies/delivery/internal-file-delivery.strategy';
import { ExternalUrlDeliveryStrategy } from '../../strategies/delivery/external-url-delivery.strategy';
import { DeliveryFactory } from './delivery.factory';
import { DownloadController } from './download.controller';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Global()
@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [DownloadController],
  providers: [
    InternalFileDeliveryStrategy,
    ExternalUrlDeliveryStrategy,
    DeliveryFactory,
  ],
  exports: [
    DeliveryFactory,
  ],
})
export class DeliveryModule {}
