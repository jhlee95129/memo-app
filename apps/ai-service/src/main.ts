import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AI_SERVICE_HOST ?? 'localhost',
        port: Number(process.env.AI_SERVICE_PORT ?? 4003),
      },
    },
  );

  await app.listen();
  console.log('AI service is listening on TCP port 4003');
}
bootstrap();
