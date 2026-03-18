import { TRPCError } from '@trpc/server';

/**
 * PartnerScope - Partner 인증 정보 기반 데이터 스코핑 타입
 *
 * Usage:
 * const scope = extractPartnerScope(ctx);
 * const scopedInput = withPartnerScope(ctx, input);
 */
export type PartnerScope =
  | { authType: 'ADMIN' }
  | { authType: 'BRAND'; brandId: number }
  | { authType: 'INFLUENCER'; influencerId: number };

/**
 * extractPartnerScope - ctx.admin에서 PartnerScope 추출
 */
export function extractPartnerScope(ctx: {
  admin: { authType: string; partnerId?: number };
}): PartnerScope {
  const { authType, partnerId } = ctx.admin;

  if (authType === 'ADMIN') {
    return { authType: 'ADMIN' };
  }

  if (!partnerId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Partner ID is required for partner authentication',
    });
  }

  if (authType === 'BRAND') {
    return { authType: 'BRAND', brandId: partnerId };
  }

  if (authType === 'INFLUENCER') {
    return { authType: 'INFLUENCER', influencerId: partnerId };
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: `Unknown auth type: ${authType}`,
  });
}

/**
 * withPartnerScope - input에 partnerScope를 주입
 * ADMIN이면 scope 없이 반환, Partner면 scope 포함
 */
export function withPartnerScope<T extends Record<string, unknown>>(
  ctx: { admin: { authType: string; partnerId?: number } },
  input: T
): T & { partnerScope?: PartnerScope } {
  const scope = extractPartnerScope(ctx);

  if (scope.authType === 'ADMIN') {
    return input;
  }

  return { ...input, partnerScope: scope };
}
