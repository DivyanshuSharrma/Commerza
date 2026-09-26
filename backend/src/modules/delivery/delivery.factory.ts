import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigContext } from '../../config/config.service';
import { DeliveryStrategy } from '../../core/interfaces/delivery-strategy.interface';
import { InternalFileDeliveryStrategy } from '../../strategies/delivery/internal-file-delivery.strategy';
import { ExternalUrlDeliveryStrategy } from '../../strategies/delivery/external-url-delivery.strategy';

@Injectable()
export class DeliveryFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly internalStrategy: InternalFileDeliveryStrategy,
    private readonly externalStrategy: ExternalUrlDeliveryStrategy,
  ) {}

  async getStrategy(context?: ConfigContext): Promise<DeliveryStrategy> {
    const provider = await this.configService.get('delivery_strategy', context, 'INTERNAL_FILE');
    
    switch (provider.toUpperCase()) {
      case 'EXTERNAL_URL':
        return this.externalStrategy;
      case 'INTERNAL_FILE':
      default:
        return this.internalStrategy;
    }
  }
}
