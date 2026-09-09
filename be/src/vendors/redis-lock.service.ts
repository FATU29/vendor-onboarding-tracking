import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisLockService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisLockService.name);
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  async withLock<T>(key: string, work: () => Promise<T>): Promise<T> {
    const token = crypto.randomUUID();
    const lockKey = `lock:${key}`;
    let locked = false;

    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      locked = (await this.redis.set(lockKey, token, 'PX', 5_000, 'NX')) === 'OK';
    } catch (error) {
      this.logger.warn(`Redis is unavailable; relying on database version checks. ${String(error)}`);
    }

    if (!locked && this.redis.status === 'ready') {
      throw new Error('VENDOR_LOCKED');
    }

    try {
      return await work();
    } finally {
      if (locked) {
        await this.redis.eval(
          'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
          1,
          lockKey,
          token,
        ).catch(() => undefined);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
  }
}
