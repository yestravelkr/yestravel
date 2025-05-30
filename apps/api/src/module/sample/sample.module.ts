import { Module } from '@nestjs/common';
import { SampleRouter } from '@src/module/sample/sample.router';
import { SampleService } from '@src/module/sample/sample.service';

@Module({
  imports: [],
  providers: [SampleRouter, SampleService],
  exports: [SampleRouter, SampleService],
})
export class SampleModule {}
