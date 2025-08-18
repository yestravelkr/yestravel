import {Global, Module} from "@nestjs/common";
import {TRPCModule} from "nestjs-trpc";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";
import {AutoRouterModule} from "@src/module/trpc/routerModule";
import {TRPCAppContext} from "@src/module/trpc/trpcAppContext";
import {AppController} from "@src/app.controller";
import {AppService} from "@src/app.service";
import { ConfigProvider } from '@src/config';

@Global()
@Module({
  providers:[MicroserviceClient],
  exports: [
    MicroserviceClient,
  ]
})
class TrpcModuleExport {
}

@Module({
  imports: [
    TrpcModuleExport,
    TRPCModule.forRoot({
      autoSchemaFile: ConfigProvider.stage === 'localdev' ? '../../packages/api-types/src' : undefined,
      context: TRPCAppContext,
    }),
    AutoRouterModule.forRoot({
      basePath: __dirname,
      pattern: '../**/*.{router,middleware}.{ts,js}',
    }),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    TRPCAppContext,
    AppService
  ],
})
export class TrpcModule {
}


