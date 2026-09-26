import { Injectable } from '@nestjs/common';
import { ConfigResolverService } from '../resolver/config-resolver.service';

@Injectable()
export class FeatureConfigService {
  constructor(private readonly resolver: ConfigResolverService) {}

  async isFeatureEnabled(flag: string, brandId?: string): Promise<boolean> {
    return this.resolver.getBoolean(`flag_${flag}`, { brandId }, false);
  }
}
