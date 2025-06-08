import {Ctx, Input, Mutation, Router, UseMiddlewares} from 'nestjs-trpc';
import {z} from "zod";
import {BackofficeAuthService} from "@src/module/backoffice/auth/backoffice.auth.service";
import {Inject} from "@nestjs/common";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";

@Router({ alias: 'backofficeAuth' })
export class BackofficeAuthRouter {

  constructor(
    @Inject(MicroserviceClient) private readonly microserviceClient: MicroserviceClient
  ) {}


  @Mutation({
    input: z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    }),
    output: z.object({
      message: z.string(),
    }),
  })
  async register(@Input('email') email: string, @Input('password') password: string): Promise<{ message: string }>{

    return this.microserviceClient.send('backoffice.auth.register', { email, password });
  }

}
