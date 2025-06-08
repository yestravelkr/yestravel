import {Module} from "@nestjs/common";
import {TRPCModule} from "nestjs-trpc";
import {SampleRouter} from "@src/module/sample/sample.router";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";
import {BackofficeAuthRouter} from "@src/module/backoffice/auth/backoffice.auth.router";


@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: './@generated',
    }),
  ],
  providers: [
    BackofficeAuthRouter,
    MicroserviceClient
  ]
})
export class TrpcModule {}