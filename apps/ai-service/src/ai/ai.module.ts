import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisCacheConfig } from '../config/redis.config.js';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';

@Module({
  imports: [CacheModule.registerAsync(redisCacheConfig)],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
