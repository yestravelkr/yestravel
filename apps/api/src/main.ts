import { NestFactory } from '@nestjs/core';
import { setupSwagger } from '@src/common/swagger-setup';
import { AppModule } from './app.module';
import { DataSources } from '@src/database/datasources';

async function bootstrap() {
  await DataSources.yestravel.initialize();
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
