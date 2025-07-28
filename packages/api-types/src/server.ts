import { initTRPC } from "@trpc/server";
import { z } from "zod";

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
    register: publicProcedure.input(z.object({
      name: z.string().min(1, 'Brand name is required'),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      businessInfo: z.object({
        type: z.nativeEnum(BusinessType).optional().nullable(),
        name: z.string().optional().nullable(),
        licenseNumber: z.string().optional().nullable(),
        ceoName: z.string().optional().nullable(),
      }).optional(),
      bankInfo: z.object({
        name: z.string().optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountHolder: z.string().optional().nullable(),
      }).optional(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      businessInfo: z.object({
        type: z.nativeEnum(BusinessType).optional().nullable(),
        name: z.string().optional().nullable(),
        licenseNumber: z.string().optional().nullable(),
        ceoName: z.string().optional().nullable(),
      }).optional().nullable(),
      bankInfo: z.object({
        name: z.string().optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountHolder: z.string().optional().nullable(),
      }).optional().nullable(),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.array(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      businessInfo: z.object({
        type: z.nativeEnum(BusinessType).optional().nullable(),
        name: z.string().optional().nullable(),
        licenseNumber: z.string().optional().nullable(),
        ceoName: z.string().optional().nullable(),
      }).optional().nullable(),
      bankInfo: z.object({
        name: z.string().optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountHolder: z.string().optional().nullable(),
      }).optional().nullable(),
      createdAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      businessInfo: z.object({
        type: z.nativeEnum(BusinessType).optional().nullable(),
        name: z.string().optional().nullable(),
        licenseNumber: z.string().optional().nullable(),
        ceoName: z.string().optional().nullable(),
      }).optional().nullable(),
      bankInfo: z.object({
        name: z.string().optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountHolder: z.string().optional().nullable(),
      }).optional().nullable(),
      createdAt: z.date(),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  sample: t.router({
    getHello: publicProcedure.input(z.object({
      name: z.string().optional(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSample: publicProcedure.output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

