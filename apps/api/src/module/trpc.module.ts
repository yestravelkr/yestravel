import { Global, Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { AutoRouterModule } from '@src/module/trpc/routerModule';
import { TRPCAppContext } from '@src/module/trpc/trpcAppContext';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ConfigProvider } from '@src/config';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { PaymentController } from '@src/module/shop/payment/payment.controller';
import { PaymentService } from '@src/module/shop/payment/payment.service';

@Global()
@Module({
  imports: [AwsModule],
  providers: [MicroserviceClient],
  exports: [MicroserviceClient, AwsModule],
})
class TrpcModuleExport {}

@Module({
  imports: [
    TrpcModuleExport,
    TRPCModule.forRoot({
      autoSchemaFile:
        ConfigProvider.stage === 'localdev'
          ? '../../packages/api-types/src'
          : undefined,
      context: TRPCAppContext,
    }),
    AutoRouterModule.forRoot({
      basePath: __dirname,
      pattern: '../**/*.{router,middleware}.{ts,js}',
    }),
  ],
  controllers: [AppController, PaymentController],
  providers: [TRPCAppContext, AppService, PaymentService],
})
export class TrpcModule {}
