import {
  ContextOptions,
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc-v2';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TRPCError } from '@trpc/server';
import { JwtService } from '@nestjs/jwt';
import { ConfigProvider } from '@src/config';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { JwtPayload } from './shop.auth.dto';

const jwtService = new JwtService();

/**
 * ShopAuthMiddleware - Shop 인증 미들웨어
 *
 * JWT Access Token을 검증하고 회원 정보를 context에 추가합니다.
 * 인증이 필요한 Shop 라우터에서 사용합니다.
 */
@Injectable()
export class ShopAuthMiddleware implements TRPCMiddleware {
  use(
    opts: MiddlewareOptions
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    if (!req.headers.authorization) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const [authType, token] = req.headers.authorization.split(' ');
    if (authType !== 'Bearer' || !token) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    let payload: JwtPayload;
    try {
      payload = jwtService.verify(token, ConfigProvider.auth.jwt.store.access);
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        cause: error,
      });
    }

    if (payload.type !== 'access') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token type',
      });
    }

    return next({
      ctx: {
        ...ctx,
        member: { id: payload.sub },
      },
    });
  }
}

/** Shop 인증된 Context 타입 */
export interface ShopAuthorizedContext extends CreateExpressContextOptions {
  member: { id: number };
}
