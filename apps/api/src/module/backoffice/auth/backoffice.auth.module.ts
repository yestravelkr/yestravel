import { Module } from "@nestjs/common";
import {BackofficeAuthService} from "@src/module/backoffice/auth/backoffice.auth.service";
import {BackofficeAuthController} from "@src/module/backoffice/auth/backoffice.auth.controller";


@Module({
  imports: [],
  controllers: [BackofficeAuthController],
  providers: [BackofficeAuthService],
  exports: [BackofficeAuthService],
})
export class BackofficeAuthModule {}