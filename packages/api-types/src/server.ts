import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  sample: t.router({
    getHello: publicProcedure.input(z.object({
      name: z.string().optional(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSample: publicProcedure.output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeCampaign: t.router({
    findAll: publicProcedure.output(z.array(z.object({
      id: z.number(),
      title: z.string(),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      title: z.string(),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    create: publicProcedure.input(z.object({
      title: z.string().min(1, 'Title is required'),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
    })).output(z.object({
      id: z.number(),
      title: z.string(),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      title: z.string().min(1, 'Title is required'),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
    }).extend({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      title: z.string(),
      startAt: z.date(),
      endAt: z.date(),
      description: z.string().nullish(),
      thumbnail: z.string().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    delete: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({ success: z.boolean() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeBrand: t.router({
    register: publicProcedure.input(z.object({
      name: z.string().min(1, 'Brand name is required'),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.array(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
      createdAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
      createdAt: z.date(),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      name: z.string().min(1, 'Brand name is required'),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
    }).extend({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeAuth: t.router({
    register: publicProcedure.input(z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
      name: z.string().min(1, '이름은 필수입니다.'),
      phoneNumber: z.string().min(1, '전화번호는 필수입니다.'),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
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
  backofficeAdmin: t.router({
    create: publicProcedure.input(z.object({
      email: z.string().email('올바른 이메일 형식이 아닙니다'),
      password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
      name: z.string().min(1, '이름은 필수입니다'),
      phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.array(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
      createdAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1, '이름은 필수입니다'),
      phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum(['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePassword: publicProcedure.input(z.object({
      id: z.number(),
      newPassword: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
    })).output(z.object({
      success: z.boolean(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

