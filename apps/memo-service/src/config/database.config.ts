import { ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const mongooseConfig: MongooseModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>(
      'MONGO_URI',
      'mongodb://memo:memo1234@localhost:27017/memo_db?authSource=admin',
    ),
  }),
  inject: [ConfigService],
};
