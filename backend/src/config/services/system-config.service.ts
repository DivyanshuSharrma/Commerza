import { Injectable } from '@nestjs/common';
import { ConfigResolverService } from '../resolver/config-resolver.service';

@Injectable()
export class SystemConfigService {
  constructor(private readonly resolver: ConfigResolverService) {}

  async getAppUrl(): Promise<string> {
    return this.resolver.resolve('app_url', {}, 'http://localhost:3000');
  }

  async getDefaultDownloadLimit(): Promise<number> {
    return this.resolver.getNumber('download_limit', {}, 5);
  }
}
