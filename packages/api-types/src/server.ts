import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  shopPayment: t.router({
    complete: publicProcedure.input(z.object({
      paymentId: z.string(),
      paymentToken: z.string(),
      transactionType: z.string(),
      txId: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  sample: t.router({
    getHello: publicProcedure.input(z.object({
      name: z.string().optional(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSample: publicProcedure.output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeUpload: t.router({
    generatePresignedUrl: publicProcedure.input(z.object({
      fileName: z.string().min(1, '파일명은 필수입니다'),
      fileType: z.string().min(1, '파일 타입은 필수입니다'),
      path: z.string().default('uploads'),
      expiresIn: z.number().min(60).max(3600).default(300),
    })).output(z.object({
      uploadUrl: z.string(),
      fileUrl: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeProductTemplate: t.router({
    findAll: publicProcedure.input(z
      .object({
        // 상품 타입 (숙박/배송상품/티켓)
        type: z.enum(PRODUCT_TYPE_ENUM_VALUE).optional(),

        // 품목명 검색 (템플릿 이름)
        name: z.string().optional(),

        // 날짜 필터 타입 (등록일/수정일)
        dateFilterType: z.enum(DATE_FILTER_TYPE_ENUM_VALUE).optional(),

        // 시작일
        startDate: z.string().datetime().optional(),

        // 종료일
        endDate: z.string().datetime().optional(),

        // 재고 관리 여부 (미지정 시 전체)
        useStock: z.boolean().optional(),

        // 연동 여부 (미지정 시 전체)
        isIntegrated: z.boolean().optional(),

        // 브랜드 ID 목록
        brandIds: z.array(z.number().int().positive()).optional(),

        // 카테고리 ID 목록
        categoryIds: z.array(z.number().int().positive()).optional(),
      })
      .merge(paginationQuerySchema).optional().default({})).output(createPaginatedResponseSchema(z.object({
        id: z.number(),
        type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
        name: z.string(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        isIntegrated: z.boolean(),
        useStock: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
    })).output(z.discriminatedUnion('type', [
      // Hotel Detail
      z.object({
        type: z.literal('HOTEL'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        baseCapacity: z.number(),
        maxCapacity: z.number(),
        checkInTime: z.string(),
        checkOutTime: z.string(),
        bedTypes: z.array(z.string()),
        tags: z.array(z.string()),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      // Delivery Detail
      z.object({
        type: z.literal('DELIVERY'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        delivery: z.object({
          deliveryFeeType: z.string(),
          deliveryFee: z.number(),
          freeDeliveryMinAmount: z.number(),
          returnDeliveryFee: z.number(),
          exchangeDeliveryFee: z.number(),
          remoteAreaExtraFee: z.number(),
          jejuExtraFee: z.number(),
          isJejuRestricted: z.boolean(),
          isRemoteIslandRestricted: z.boolean(),
        }),
        exchangeReturnInfo: z.string(),
        productInfoNotice: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      // ETicket Detail
      z.object({
        type: z.literal('E-TICKET'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ])).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    create: publicProcedure.input(z.discriminatedUnion('type', [
      // Hotel Template
      z.object({
        type: z.literal('HOTEL'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        baseCapacity: z
          .number()
          .int()
          .positive('기준인원은 1명 이상이어야 합니다'),
        maxCapacity: z
          .number()
          .int()
          .positive('최대인원은 1명 이상이어야 합니다'),
        checkInTime: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
            '입실 시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다'
          )
          .transform(normalizeTime),
        checkOutTime: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
            '퇴실 시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다'
          )
          .transform(normalizeTime),
        bedTypes: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
      }),
      // Delivery Template
      z.object({
        type: z.literal('DELIVERY'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        delivery: z.object({
          deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
          deliveryFee: z.number().int().nonnegative().default(0),
          freeDeliveryMinAmount: z.number().int().nonnegative().default(0),
          returnDeliveryFee: z.number().int().nonnegative().default(0),
          exchangeDeliveryFee: z.number().int().nonnegative().default(0),
          remoteAreaExtraFee: z.number().int().nonnegative().default(0),
          jejuExtraFee: z.number().int().nonnegative().default(0),
          isJejuRestricted: z.boolean().default(false),
          isRemoteIslandRestricted: z.boolean().default(false),
        }),
        exchangeReturnInfo: z.string().default(''),
        productInfoNotice: z.string().default(''),
      }),
      // ETicket Template
      z.object({
        type: z.literal('E-TICKET'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
      }),
    ])).output(z.object({
      id: z.number(),
      type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']),
      name: z.string(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
      name: z.string().min(1, '상품명은 필수입니다'),
      brandId: z.number().int().positive('브랜드를 선택해주세요'),
      categoryIds: z.array(z.number().int().positive()).optional(),
      thumbnailUrls: z.array(z.string().url()).optional(),
      description: z.string().optional(),
      detailContent: z.string().optional(),
      useStock: z.boolean().optional(),
      // Hotel 전용 필드
      baseCapacity: z.number().int().positive().optional(),
      maxCapacity: z.number().int().positive().optional(),
      checkInTime: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .transform(normalizeTime)
        .optional(),
      checkOutTime: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .transform(normalizeTime)
        .optional(),
      bedTypes: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      // Delivery 전용 필드
      useOptions: z.boolean().optional(),
      delivery: z
        .object({
          deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
          deliveryFee: z.number().int().nonnegative().optional(),
          freeDeliveryMinAmount: z.number().int().nonnegative().optional(),
          returnDeliveryFee: z.number().int().nonnegative().optional(),
          exchangeDeliveryFee: z.number().int().nonnegative().optional(),
          remoteAreaExtraFee: z.number().int().nonnegative().optional(),
          jejuExtraFee: z.number().int().nonnegative().optional(),
          isJejuRestricted: z.boolean().optional(),
          isRemoteIslandRestricted: z.boolean().optional(),
        })
        .optional(),
      exchangeReturnInfo: z.string().optional(),
      productInfoNotice: z.string().optional(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    delete: publicProcedure.input(z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
    })).output(z.object({
      id: z.number(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  backofficeCategory: t.router({
    create: publicProcedure.input(z.object({
      name: z.string().min(1, '카테고리 이름은 필수입니다'),
      productType: z.enum(PRODUCT_TYPE_ENUM_VALUE),
      parentId: z.number().nullish(),
    })).output(z.object({
      id: z.number(),
      name: z.string(),
      productType: z.string(),
      parentId: z.number().nullish(),
      level: z.number(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.input(z
      .object({
        productType: z.enum(PRODUCT_TYPE_ENUM_VALUE).optional(),
      })
      .optional()).output(z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          productType: z.string(),
          parentId: z.number().nullish(),
          level: z.number(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
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
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
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
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
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
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
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
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
      }).nullish(),
      bankInfo: z.object({
        name: z.string().nullish(),
        accountNumber: z.string().nullish(),
        accountHolder: z.string().nullish(),
      }).nullish(),
      createdAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      name: z.string().min(1, 'Brand name is required'),
      email: z.string().email().nullish(),
      phoneNumber: z.string().nullish(),
      businessInfo: z.object({
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
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
        type: z.enum([
          'CORPORATION',
          'SOLE_PROPRIETOR',
          'INDIVIDUAL',
        ] as const).nullish(),
        name: z.string().nullish(),
        licenseNumber: z.string().nullish(),
        ceoName: z.string().nullish(),
        licenseFileUrl: z.string().nullish(),
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
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
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
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.array(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findById: publicProcedure.input(z.object({
      id: z.number(),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
      createdAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1, '이름은 필수입니다'),
      phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
    })).output(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      role: z.enum([
        'ADMIN_SUPER',
        'ADMIN_STAFF',
        'PARTNER_SUPER',
        'PARTNER_STAFF',
      ] as const),
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

