import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { SampleModule } from '@src/module/sample/sample.module';
import { BackofficeModule } from '@src/module/backoffice/backoffice.module';

@Module({
  imports: [SharedModule, SampleModule, BackofficeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
