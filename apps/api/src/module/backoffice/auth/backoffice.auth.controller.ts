import { MessagePattern } from '@nestjs/microservices';
import {BackofficeAuthService} from "@src/module/backoffice/auth/backoffice.auth.service";
import {Controller, Inject} from "@nestjs/common";
import {Transactional} from "@src/module/shared/transaction/transaction.decorator";
import {TransactionService} from "@src/module/shared/transaction/transaction.service";
import {Ctx} from "nestjs-trpc";

@Controller()
export class BackofficeAuthController {

  constructor(
    private readonly backofficeAuthService: BackofficeAuthService,
    private readonly transactionService: TransactionService
  ) {}



  @MessagePattern('backoffice.auth.register')
  @Transactional
  async register(data:{email: string, password: string}): Promise<{ message: string }>{
    const { email, password } = data;
    await this.backofficeAuthService.register(email, password);

    // 현재는 단순히 성공 메시지를 반환합니다.
    return { message: '회원가입이 완료되었습니다.' };
  }

  @MessagePattern('backoffice.auth.login')
  async login(data: {email: string, password: string}): Promise<{ accessToken: string, refreshToken: string }> {
    const { email, password } = data;
    return this.backofficeAuthService.login(email, password);
  }

}
