import { Injectable } from '@nestjs/common';
import { ConfigResolverService } from '../resolver/config-resolver.service';

@Injectable()
export class ProductConfigService {
  constructor(private readonly resolver: ConfigResolverService) {}

  async getStorageProvider(brandId?: string, productId?: string): Promise<string> {
    return this.resolver.resolve('storage_provider', { brandId, productId }, 'LOCAL');
  }

  async getPaymentProvider(brandId?: string, productId?: string): Promise<string> {
    return this.resolver.resolve('payment_provider', { brandId, productId }, 'MOCK');
  }

  async getEmailProvider(brandId?: string, productId?: string): Promise<string> {
    return this.resolver.resolve('email_provider', { brandId, productId }, 'MOCK');
  }
}
