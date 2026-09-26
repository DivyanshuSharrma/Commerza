import { Module, Global } from '@nestjs/common';
import { MemoryCacheStrategy } from './strategies/memory-cache.strategy';
import { RedisCacheStrategy } from './strategies/redis-cache.strategy';
import { CacheFactory } from './cache.factory';

@Global()
@Module({
  providers: [MemoryCacheStrategy, RedisCacheStrategy, CacheFactory],
  exports: [CacheFactory],
})
export class CacheModule {}
