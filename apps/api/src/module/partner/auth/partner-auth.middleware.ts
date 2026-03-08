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
import { PartnerAuthPayload } from './partner-auth.type';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const jwtService = new JwtService();

@Injectable()
export class PartnerAuthMiddleware implements TRPCMiddleware {
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

    let partnerPayload: PartnerAuthPayload;
    try {
      partnerPayload = jwtService.verify(
        token,
        ConfigProvider.auth.jwt.partner.access
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
        partner: partnerPayload,
      },
    });
  }
}

export interface PartnerAuthorizedContext extends CreateExpressContextOptions {
  partner: PartnerAuthPayload;
}
