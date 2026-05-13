import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoController } from './memo.controller.js';
import { MemoService } from './memo.service.js';
import { Memo, MemoSchema } from './schemas/memo.schema.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Memo.name, schema: MemoSchema }]),
    AiModule,
  ],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
