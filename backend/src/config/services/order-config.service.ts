import { Injectable } from '@nestjs/common';
import { ConfigResolverService } from '../resolver/config-resolver.service';

@Injectable()
export class OrderConfigService {
  constructor(private readonly resolver: ConfigResolverService) {}

  async getDownloadLimit(brandId?: string, productId?: string, orderId?: string): Promise<number> {
    return this.resolver.getNumber('download_limit', { brandId, productId, orderId }, 5);
  }

  async getLinkExpiryHours(brandId?: string, productId?: string, orderId?: string): Promise<number> {
    return this.resolver.getNumber('link_expiry_hours', { brandId, productId, orderId }, 24);
  }
}
