import { Module } from '@nestjs/common';
import { AlrimtalkService } from './alrimtalk.service';

@Module({
  providers: [AlrimtalkService],
  exports: [AlrimtalkService],
})
export class AlrimtalkModule {}
