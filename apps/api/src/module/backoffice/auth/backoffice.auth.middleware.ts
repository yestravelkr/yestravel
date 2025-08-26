import {
  ContextOptions,
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TRPCError } from '@trpc/server';
import { JwtService } from '@nestjs/jwt';
import { ConfigProvider } from '@src/config';
import { AdminAuthPayload } from '@src/module/backoffice/auth/backoffice.auth.service';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const jwtService = new JwtService();

@Injectable()
export class BackofficeAuthMiddleware implements TRPCMiddleware {
  use(
    opts: MiddlewareOptions
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, path, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    if (!req.headers.authorization) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const [authType, token] = req.headers.authorization.split(' ');
    if (authType !== 'Bearer' || !token) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    let adminPayload;
    try {
      adminPayload = jwtService.verify(
        token,
        ConfigProvider.auth.jwt.backoffice.access
      );
    } catch (e) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        cause: e,
      });
    }

    return next({
      ctx: {
        ...ctx,
        admin: adminPayload,
      },
    });
  }
}

export interface BackofficeAuthorizedContext
  extends CreateExpressContextOptions {
  admin: AdminAuthPayload;
}
