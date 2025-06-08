import {Global, Module} from "@nestjs/common";
import {TRPCModule} from "nestjs-trpc";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";
import {BackofficeAuthRouter} from "@src/module/backoffice/auth/backoffice.auth.router";
import {AutoRouterModule} from "@src/module/trpc/routerModule";

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
    }),
    AutoRouterModule.forRoot({
      basePath: __dirname,
      pattern: '../**/*.router.{ts,js}',
    }),
  ],
})
export class TrpcModule {
}


