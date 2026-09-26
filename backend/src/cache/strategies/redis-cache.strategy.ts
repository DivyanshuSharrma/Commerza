import { CacheStrategy } from '../cache-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private readonly logger = new Logger(RedisCacheStrategy.name);

  async get(key: string): Promise<string | null> {
    this.logger.debug(`[RedisCache] GET ${key}`);
    return null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.logger.debug(`[RedisCache] SET ${key} (ttl: ${ttlSeconds}s)`);
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`[RedisCache] DEL ${key}`);
  }
}
