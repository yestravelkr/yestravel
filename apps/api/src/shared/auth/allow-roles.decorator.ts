import {
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
  UseMiddlewares,
} from 'nestjs-trpc-v2';
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import type {
  AuthType,
  AuthLevel,
} from '@src/module/backoffice/auth/backoffice.auth.service';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';

const LEVEL_HIERARCHY: Record<AuthLevel, number> = {
  STAFF: 0,
  SUPER: 1,
};

/**
 * AllowRoles - Type/Level 기반 접근 제어 데코레이터
 *
 * Usage:
 * @AllowRoles(['ADMIN'], 'SUPER') → ADMIN_SUPER만 허용
 * @AllowRoles(['ADMIN', 'BRAND'], 'STAFF') → ADMIN + BRAND 모두 허용 (STAFF 이상)
 */
export function AllowRoles(
  types: AuthType[],
  level: AuthLevel = 'STAFF'
): MethodDecorator & ClassDecorator {
  @Injectable()
  class RoleGuardMiddleware implements TRPCMiddleware {
    use(
      opts: MiddlewareOptions
    ): MiddlewareResponse | Promise<MiddlewareResponse> {
      const admin = (opts.ctx as BackofficeAuthorizedContext).admin;

      if (!admin) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '@AllowRoles must be used after BackofficeAuthMiddleware',
        });
      }
      if (!admin.authType) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      if (!types.includes(admin.authType)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        });
      }

      if (LEVEL_HIERARCHY[admin.authLevel] < LEVEL_HIERARCHY[level]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '권한 수준이 부족합니다',
        });
      }

      return opts.next();
    }
  }

  return UseMiddlewares(RoleGuardMiddleware);
}
