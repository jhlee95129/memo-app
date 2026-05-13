import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller.js';

@Module({
  controllers: [MemoController],
})
export class MemoModule {}
