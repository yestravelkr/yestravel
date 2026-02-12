import { Global, Module } from '@nestjs/common';
import { RequestModule } from '@src/module/shared/request/request.module';
import { TransactionModule } from '@src/module/shared/transaction/transaction.module';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { NotificationModule } from '@src/module/shared/notification/notification.module';

@Global()
@Module({
  imports: [RequestModule, TransactionModule, AwsModule, NotificationModule],
  exports: [RequestModule, TransactionModule, AwsModule, NotificationModule],
})
export class SharedModule {}
