import {Global, Module} from "@nestjs/common";
import {TRPCModule} from "nestjs-trpc";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";
import {BackofficeAuthRouter} from "@src/module/backoffice/auth/backoffice.auth.router";
import {AutoRouterModule} from "@src/module/trpc/routerModule";
import {TRPCAppContext} from "@src/module/trpc/trpcAppContext";
import {BackofficeAuthMiddleware} from "@src/module/backoffice/auth/backoffice.auth.middleware";

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
      autoSchemaFile: './@generated',
      context: TRPCAppContext,
    }),
    AutoRouterModule.forRoot({
      basePath: __dirname,
      pattern: '../**/*.{router,middleware}.{ts,js}',
    }),
  ],
  providers: [
    TRPCAppContext
  ],
})
export class TrpcModule {
}


