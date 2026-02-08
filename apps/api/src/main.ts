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

  // Get Express instance and configure trust proxy
  const expressApp = trpcApp.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Health check endpoint (CORS 전체 허용)
  expressApp.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok' });
  });

  trpcApp.use(cookieParser());
  trpcApp.enableCors(ConfigProvider.cors);

  await trpcApp.listen(3000);
}
bootstrap();
