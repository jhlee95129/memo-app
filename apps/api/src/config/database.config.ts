import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'memo'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'memo1234'),
    database: configService.get<string>('POSTGRES_DB', 'memo_auth'),
    autoLoadEntities: true,
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
  }),
  inject: [ConfigService],
};

export const mongooseConfig: MongooseModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>(
      'MONGO_URI',
      'mongodb://memo:memo1234@localhost:27017/memo_db?authSource=admin',
    ),
  }),
  inject: [ConfigService],
};
