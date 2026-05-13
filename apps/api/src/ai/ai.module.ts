import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisCacheConfig } from '../config/redis.config.js';
import { AiService } from './ai.service.js';

@Module({
  imports: [CacheModule.registerAsync(redisCacheConfig)],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
