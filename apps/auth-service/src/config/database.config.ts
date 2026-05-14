import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'memo'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'memo1234'),
    database: configService.get<string>('POSTGRES_DB', 'memo_auth'),
    autoLoadEntities: true,
    synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE', 'false') === 'true' ||
      configService.get<string>('NODE_ENV') !== 'production',
    ssl: configService.get<string>('POSTGRES_SSL', 'false') === 'true'
      ? { rejectUnauthorized: false }
      : false,
  }),
  inject: [ConfigService],
};
