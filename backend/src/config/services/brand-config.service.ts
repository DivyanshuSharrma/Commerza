import { Injectable } from '@nestjs/common';
import { ConfigResolverService } from '../resolver/config-resolver.service';

@Injectable()
export class BrandConfigService {
  constructor(private readonly resolver: ConfigResolverService) {}

  async getBrandPrimaryColor(brandId: string): Promise<string> {
    return this.resolver.resolve('primary_color', { brandId }, '#4f46e5');
  }

  async getBrandSecondaryColor(brandId: string): Promise<string> {
    return this.resolver.resolve('secondary_color', { brandId }, '#06b6d4');
  }
}
