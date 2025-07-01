import {Ctx, Input, Mutation, Query, Router, UseMiddlewares} from 'nestjs-trpc';
import {z} from "zod";
import {BaseTrpcRouter} from "@src/module/trpc/baseTrpcRouter";
import {
  BackofficeAuthMiddleware,
  BackofficeAuthorizedContext
} from "@src/module/backoffice/auth/backoffice.auth.middleware";

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

  @Mutation({
    input: z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string(),
    }),
    output: z.object({
      accessToken: z.string(),
    }),
  })
  async login(@Input() data: {email: string, password: string}, @Ctx() ctx: any): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.microserviceClient.send('backoffice.auth.login', data);

    ctx.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서는 secure 설정
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
    });
    return { accessToken }
  }

  @Mutation({
    output: z.object({
      accessToken: z.string(),
    }),
  })
  async refresh(@Ctx() ctx: any): Promise<{ accessToken: string }> {
    const refreshToken = ctx.req.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    return this.microserviceClient.send('backoffice.auth.refresh', { refreshToken });
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.object({
      message: z.string(),
    }),
  })
  test(@Ctx() ctx: BackofficeAuthorizedContext): { message: string } {
    return { message: `인증된 사용자 ${ctx.admin.email}` };
  }


}
