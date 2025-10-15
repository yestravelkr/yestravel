import { Module } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service';
import { ProductTemplateController } from './product-template.controller';

@Module({
  providers: [ProductTemplateService, ProductTemplateController],
  exports: [ProductTemplateService, ProductTemplateController],
})
export class ProductTemplateModule {}
