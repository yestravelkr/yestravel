import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { registerBrandInputSchema, findBrandByIdInputSchema, brandSchema } from "./brand";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  backofficeAuth: t.router({
    register: publicProcedure.input(z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    })).output(z.object({
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    login: publicProcedure.input(z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string(),
    })).output(z.object({
      accessToken: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    refresh: publicProcedure.output(z.object({
      accessToken: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    test: publicProcedure.output(z.object({
      message: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeBrand: t.router({
    register: publicProcedure.input(registerBrandInputSchema).output(brandSchema).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.array(brandSchema)).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(findBrandByIdInputSchema).output(brandSchema.nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeCampaign: t.router({
    findAll: publicProcedure.output(z.array(campaignSchema)).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(findCampaignByIdInputSchema).output(campaignSchema).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    create: publicProcedure.input(createCampaignInputSchema).output(campaignSchema).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(updateCampaignInputSchema).output(campaignSchema).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    delete: publicProcedure.input(deleteCampaignInputSchema).output(z.object({ success: z.boolean() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  sample: t.router({
    getHello: publicProcedure.input(z.object({
      name: z.string().optional(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSample: publicProcedure.output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

