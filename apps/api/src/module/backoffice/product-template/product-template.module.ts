import { Module } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service';
import { ProductTemplateController } from './product-template.controller';
import { ProductTemplateRouter } from './product-template.router';

@Module({
  providers: [
    ProductTemplateService,
    ProductTemplateController,
    ProductTemplateRouter,
  ],
  exports: [
    ProductTemplateService,
    ProductTemplateController,
    ProductTemplateRouter,
  ],
})
export class ProductTemplateModule {}
