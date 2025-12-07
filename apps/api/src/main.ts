import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSources } from '@src/database/datasources';
import { TrpcModule } from '@src/module/trpc.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { InMemoryMicroserviceStrategy } from '@src/module/trpc/inmemoryMicroserviceStrategy';
import { ConfigProvider } from '@src/config';
import cookieParser from 'cookie-parser';
import { MicroserviceExceptionFilter } from '@src/utils/microservice-exception.filter';

async function bootstrap() {
  await DataSources.yestravel.initialize();
  // App Microservice
  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new InMemoryMicroserviceStrategy(),
    });

  // Add GlobalExceptionFilter to microservice
  microservice.useGlobalFilters(new MicroserviceExceptionFilter());
  await microservice.listen();
  const trpcApp = await NestFactory.create(TrpcModule);

  // Trust proxy to get real client IP and headers from ALB
  trpcApp.set('trust proxy', true);

  // Debug: Log incoming headers
  trpcApp.use((req, res, next) => {
    console.log('=== Incoming Request ===');
    console.log('Origin:', req.headers.origin);
    console.log('Host:', req.headers.host);
    console.log('X-Forwarded-Host:', req.headers['x-forwarded-host']);
    console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
    console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
    console.log('Referer:', req.headers.referer);
    next();
  });

  trpcApp.use(cookieParser());
  trpcApp.enableCors(ConfigProvider.cors);

  await trpcApp.listen(3000);
}
bootstrap();
