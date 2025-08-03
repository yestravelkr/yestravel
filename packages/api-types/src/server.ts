import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Brand schemas
const businessInfoSchema = z.object({
  type: z
    .enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'])
    .optional()
    .nullable(),
  name: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  ceoName: z.string().optional().nullable(),
});

const bankInfoSchema = z.object({
  name: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
});

const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  businessInfo: businessInfoSchema.optional().nullable(),
  bankInfo: bankInfoSchema.optional().nullable(),
  createdAt: z.date(),
});

const registerBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  businessInfo: businessInfoSchema.optional(),
  bankInfo: bankInfoSchema.optional(),
});

const findBrandByIdInputSchema = z.object({
  id: z.number(),
});

// Campaign schemas
const campaignSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createCampaignInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
});

const updateCampaignInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
});

const findCampaignByIdInputSchema = z.object({
  id: z.number(),
});

const deleteCampaignInputSchema = z.object({
  id: z.number(),
});

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  backofficeAuth: t.router({
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email('이메일 형식이 아닙니다.'),
          password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
          name: z.string().min(1, '이름은 필수입니다.'),
          phoneNumber: z.string().min(1, '전화번호는 필수입니다.'),
          role: z.enum([
            'ADMIN_SUPER',
            'ADMIN_STAFF',
            'PARTNER_SUPER',
            'PARTNER_STAFF',
          ]),
        })
      )
      .output(
        z.object({
          message: z.string(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email('이메일 형식이 아닙니다.'),
          password: z.string(),
        })
      )
      .output(
        z.object({
          accessToken: z.string(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    refresh: publicProcedure
      .output(
        z.object({
          accessToken: z.string(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    test: publicProcedure
      .output(
        z.object({
          message: z.string(),
        })
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  backofficeBrand: t.router({
    register: publicProcedure
      .input(registerBrandInputSchema)
      .output(brandSchema)
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    findAll: publicProcedure
      .output(z.array(brandSchema))
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    findById: publicProcedure
      .input(findBrandByIdInputSchema)
      .output(brandSchema.nullable())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  backofficeCampaign: t.router({
    findAll: publicProcedure
      .output(z.array(campaignSchema))
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    findById: publicProcedure
      .input(findCampaignByIdInputSchema)
      .output(campaignSchema.nullable())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    create: publicProcedure
      .input(createCampaignInputSchema)
      .output(campaignSchema)
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    update: publicProcedure
      .input(updateCampaignInputSchema)
      .output(campaignSchema)
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    delete: publicProcedure
      .input(deleteCampaignInputSchema)
      .output(z.object({ success: z.boolean() }))
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  sample: t.router({
    getHello: publicProcedure
      .input(
        z.object({
          name: z.string().optional(),
        })
      )
      .output(z.string())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getSample: publicProcedure
      .output(z.string())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
});
export type AppRouter = typeof appRouter;
