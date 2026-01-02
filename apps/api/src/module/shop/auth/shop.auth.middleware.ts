import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TRPCError } from '@trpc/server';
import {
  ContextOptions,
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { ConfigProvider } from '@src/config';
import { MemberAuthPayload } from './shop.auth.service';

const jwtService = new JwtService();

/**
 * ShopAuthMiddleware - Shop 인증 미들웨어
 * Bearer 토큰을 검증하고 member 정보를 ctx에 주입
 */
@Injectable()
export class ShopAuthMiddleware implements TRPCMiddleware {
  use(opts: MiddlewareOptions): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    if (!req.headers.authorization) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' });
    }

    const [authType, token] = req.headers.authorization.split(' ');
    if (authType !== 'Bearer' || !token) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '잘못된 인증 형식입니다' });
    }

    let memberPayload: MemberAuthPayload;
    try {
      memberPayload = jwtService.verify(
        token,
        ConfigProvider.auth.jwt.store.access
      );
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '유효하지 않은 토큰입니다',
        cause: error,
      });
    }

    return next({
      ctx: {
        ...ctx,
        member: memberPayload,
      },
    });
  }
}

/**
 * ShopAuthorizedContext - 인증된 요청의 Context 타입
 */
export interface ShopAuthorizedContext extends CreateExpressContextOptions {
  member: MemberAuthPayload;
}
