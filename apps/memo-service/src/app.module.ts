import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from './config/database.config.js';
import { MemoModule } from './memo/memo.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync(mongooseConfig),
    MemoModule,
  ],
})
export class AppModule {}
