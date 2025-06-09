import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSources } from '@src/database/datasources';
import {TrpcModule} from "@src/module/trpc.module";
import {MicroserviceOptions} from "@nestjs/microservices";
import {InMemoryMicroserviceStrategy} from "@src/module/trpc/inmemoryMicroserviceStrategy";

async function bootstrap() {
  await DataSources.yestravel.initialize();
  // App Microservice
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new InMemoryMicroserviceStrategy(),
    },
  );
  await microservice.listen();
  const trpcApp = await NestFactory.create(TrpcModule);
  await trpcApp.listen(3000);
}
bootstrap();
