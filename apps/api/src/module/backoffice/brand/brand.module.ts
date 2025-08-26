import { Module } from '@nestjs/common';
import { BrandController } from '@src/module/backoffice/brand/brand.controller';
import { BrandService } from '@src/module/backoffice/brand/brand.service';

@Module({
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
