import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MEMO_SERVICE } from '@memo-app/common';
import { MemoController } from './memo.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MEMO_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MEMO_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('MEMO_SERVICE_PORT', 4002),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MemoController],
})
export class MemoModule {}
