import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, MEMO_SERVICE } from '@memo-app/common';
import { AuthModule } from './auth/auth.module.js';
import { MemoModule } from './memo/memo.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('AUTH_SERVICE_PORT', 4001),
          },
        }),
        inject: [ConfigService],
      },
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
    AuthModule,
    MemoModule,
  ],
})
export class AppModule {}
