import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MemoController } from './memo.controller.js';
import { MemoService } from './memo.service.js';
import { Memo, MemoSchema } from './schemas/memo.schema.js';
import { AI_SERVICE } from '@memo-app/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Memo.name, schema: MemoSchema }]),
    ClientsModule.registerAsync([
      {
        name: AI_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AI_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('AI_SERVICE_PORT', 4003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
