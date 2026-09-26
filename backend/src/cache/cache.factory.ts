import { Injectable } from '@nestjs/common';
import { MemoryCacheStrategy } from './strategies/memory-cache.strategy';
import { RedisCacheStrategy } from './strategies/redis-cache.strategy';
import { CacheStrategy } from './cache-strategy.interface';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CacheFactory {
  constructor(
    private readonly memoryStrategy: MemoryCacheStrategy,
    private readonly redisStrategy: RedisCacheStrategy,
    private readonly configService: ConfigService,
  ) {}

  async getStrategy(): Promise<CacheStrategy> {
    const cacheProvider = await this.configService.get('cache_provider', {}, 'MEMORY');
    if (cacheProvider === 'REDIS') {
      return this.redisStrategy;
    }
    return this.memoryStrategy;
  }
}
