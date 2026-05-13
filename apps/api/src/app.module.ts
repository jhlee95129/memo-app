import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module.js';
import { typeOrmConfig, mongooseConfig } from './config/database.config.js';
import { AuthModule } from './auth/auth.module.js';
import { MemoModule } from './memo/memo.module.js';
import { AiModule } from './ai/ai.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MongooseModule.forRootAsync(mongooseConfig),
    AuthModule,
    MemoModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
