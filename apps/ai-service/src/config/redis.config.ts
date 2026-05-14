import { ConfigService } from '@nestjs/config';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisCacheConfig: CacheModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL', '');
    const storeOptions = redisUrl
      ? { url: redisUrl }
      : {
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
    return {
      store: await redisStore({
        ...storeOptions,
        ttl: 60 * 60 * 24 * 1000, // 24시간 (ms)
      }),
    };
  },
  inject: [ConfigService],
};
