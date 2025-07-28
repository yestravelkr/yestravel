import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';

@Module({
  imports: [
    BackofficeAuthModule,
    BrandModule,
  ],
  exports: [
    BackofficeAuthModule,
    BrandModule,
  ],
})
export class BackofficeModule {}