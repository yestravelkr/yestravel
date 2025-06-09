import {Ctx, Input, Mutation, Router, UseMiddlewares} from 'nestjs-trpc';
import {z} from "zod";
import {BaseTrpcRouter} from "@src/module/trpc/baseTrpcRouter";

@Router({ alias: 'backofficeAuth' })
export class BackofficeAuthRouter extends BaseTrpcRouter {


  @Mutation({
    input: z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    }),
    output: z.object({
      message: z.string(),
    }),
  })
  async register(@Input() data: {email: string, password: string}): Promise<{ message: string }>{

    return this.microserviceClient.send('backoffice.auth.register', data);
  }

}
