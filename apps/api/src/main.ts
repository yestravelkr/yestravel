import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSources } from '@src/database/datasources';

async function bootstrap() {
  await DataSources.yestravel.initialize();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
