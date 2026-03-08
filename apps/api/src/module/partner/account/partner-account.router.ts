import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc-v2';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { RoleEnum } from '@src/module/backoffice/admin/admin.schema';
import {
  PartnerAuthMiddleware,
  PartnerAuthorizedContext,
} from '@src/module/partner/auth/partner-auth.middleware';
import {
  createStaffInputSchema,
  staffItemSchema,
  profileOutputSchema,
} from './partner-account.schema';

@Router({ alias: 'partnerAccount' })
@UseMiddlewares(PartnerAuthMiddleware)
export class PartnerAccountRouter extends BaseTrpcRouter {
  private isBrand(ctx: PartnerAuthorizedContext): boolean {
    return ctx.partner.partnerType === 'BRAND';
  }

  @Mutation({
    input: createStaffInputSchema,
    output: z.object({ id: z.number(), email: z.string() }),
  })
  async createStaff(
    @Input()
    data: {
      email: string;
      password: string;
      name: string;
      phoneNumber: string;
    },
    @Ctx() ctx: PartnerAuthorizedContext
  ): Promise<{ id: number; email: string }> {
    if (ctx.partner.role !== RoleEnum.PARTNER_SUPER) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'SUPER 권한이 필요합니다',
      });
    }

    if (this.isBrand(ctx)) {
      return this.microserviceClient.send('backoffice.brand.createManager', {
        ...data,
        brandId: ctx.partner.partnerId,
        role: RoleEnum.PARTNER_STAFF,
      });
    }

    return this.microserviceClient.send('influencer.createManager', {
      ...data,
      influencerId: ctx.partner.partnerId,
      role: RoleEnum.PARTNER_STAFF,
    });
  }

  @Query({
    output: z.array(staffItemSchema),
  })
  async findAllStaff(@Ctx() ctx: PartnerAuthorizedContext) {
    if (this.isBrand(ctx)) {
      return this.microserviceClient.send('backoffice.brand.findManagers', {
        brandId: ctx.partner.partnerId,
      });
    }

    return this.microserviceClient.send('influencer.findManagers', {
      influencerId: ctx.partner.partnerId,
    });
  }

  @Mutation({
    input: z.object({ id: z.number() }),
    output: z.object({ success: z.boolean() }),
  })
  async deleteStaff(
    @Input() data: { id: number },
    @Ctx() ctx: PartnerAuthorizedContext
  ): Promise<{ success: boolean }> {
    if (ctx.partner.role !== RoleEnum.PARTNER_SUPER) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'SUPER 권한이 필요합니다',
      });
    }

    if (this.isBrand(ctx)) {
      return this.microserviceClient.send('backoffice.brand.deleteManager', {
        id: data.id,
        brandId: ctx.partner.partnerId,
      });
    }

    return this.microserviceClient.send('influencer.deleteManager', {
      id: data.id,
      influencerId: ctx.partner.partnerId,
    });
  }

  @Query({
    output: profileOutputSchema,
  })
  async getProfile(@Ctx() ctx: PartnerAuthorizedContext) {
    const pattern = this.isBrand(ctx)
      ? 'backoffice.brand.findManagerById'
      : 'influencer.findManagerById';

    return this.microserviceClient.send(pattern, { id: ctx.partner.id });
  }
}
