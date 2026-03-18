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
import {
  AdminAuthPayload,
  AuthType,
  AuthLevel,
} from '@src/module/backoffice/auth/backoffice.auth.service';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const jwtService = new JwtService();

@Injectable()
export class BackofficeAuthMiddleware implements TRPCMiddleware {
  use(
    opts: MiddlewareOptions
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    if (!req.headers.authorization) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const [bearerType, token] = req.headers.authorization.split(' ');
    if (bearerType !== 'Bearer' || !token) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    let payload: any;
    let authType: AuthType;
    let authLevel: AuthLevel;
    let partnerId: number | undefined;

    try {
      payload = jwtService.verify(
        token,
        ConfigProvider.auth.jwt.backoffice.access
      );
      authType = 'ADMIN';
    } catch {
      try {
        payload = jwtService.verify(
          token,
          ConfigProvider.auth.jwt.partner.access
        );
        authType = payload.partnerType;
        partnerId = payload.partnerId;
      } catch (e) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
          cause: e,
        });
      }
    }

    authLevel = payload.role?.endsWith('_SUPER') ? 'SUPER' : 'STAFF';

    const adminPayload: AdminAuthPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      authType,
      authLevel,
      partnerId,
    };

    return next({
      ctx: {
        ...ctx,
        admin: adminPayload,
      },
    });
  }
}

export interface BackofficeAuthorizedContext extends CreateExpressContextOptions {
  admin: AdminAuthPayload;
}
