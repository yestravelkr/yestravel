import { Global, Module } from '@nestjs/common';
import { RequestModule } from '@src/module/shared/request/request.module';
import { TransactionModule } from '@src/module/shared/transaction/transaction.module';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { AlrimtalkModule } from '@src/module/shared/alrimtalk/alrimtalk.module';

@Global()
@Module({
  imports: [RequestModule, TransactionModule, AwsModule, AlrimtalkModule],
  exports: [RequestModule, TransactionModule, AwsModule, AlrimtalkModule],
})
export class SharedModule {}
