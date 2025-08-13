import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRouter } from './admin.router';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRouter],
  exports: [AdminService],
})
export class AdminModule {}