---
title: Schema & DTO 패턴
estimated_tokens: ~500
---

# Schema & DTO 패턴

## Zod 스키마 작성

### 기본 스키마

```typescript
// module.schema.ts
import { z } from 'zod';

export const moduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullish(),
  createdAt: z.date(),
});
```

### Input 스키마

```typescript
// Create
export const createModuleInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
});

// Update = Create.extend
export const updateModuleInputSchema = createModuleInputSchema.extend({
  id: z.number(),
});
```

### nullish() 통일

```typescript
// ❌ 잘못된 방법
email: z.string().optional().nullable()

// ✅ 올바른 방법
email: z.string().nullish()
```

## DTO 파일 분리

```typescript
// ❌ Service 파일에 직접 정의 금지
// module.service.ts
interface CreateModuleInput {
  name: string;
}

// ✅ DTO 파일로 분리
// module.dto.ts
export interface CreateModuleInput {
  name: string;
  email: string | null | undefined;
}

export interface ModuleListResponse {
  data: Module[];
  total: number;
}

// module.service.ts
import type { CreateModuleInput, ModuleListResponse } from './module.dto';
```

## Router에서 스키마 사용

```typescript
// ⚠️ 외부 스키마 import 금지, 직접 정의
@Router({ alias: 'moduleName' })
export class ModuleRouter extends BaseTrpcRouter {
  @Mutation({
    // ✅ z.object() 직접 사용
    input: z.object({
      name: z.string().min(1),
      email: z.string().email().nullish(),
    }),
    output: z.object({
      id: z.number(),
      message: z.string(),
    })
  })
  async create(@Input() input: CreateModuleInput) {
    return this.microserviceClient.send('moduleName.create', input);
  }
}
```

## Enum 스키마

```typescript
// ⚠️ 미리 정의된 enumSchema 사용 금지, 직접 정의
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

// ✅ z.enum() 직접 사용
export const getTmpOrderOutputSchema = z.object({
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  totalAmount: z.number(),
});
```

## 타입 추론

```typescript
// 스키마에서 타입 추론
export type Module = z.infer<typeof moduleSchema>;
export type CreateModuleInput = z.infer<typeof createModuleInputSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleInputSchema>;
```

## Controller 응답 포맷팅

```typescript
@MessagePattern('moduleName.findOne')
async findOne(id: number): Promise<Module> {
  const result = await this.moduleService.findOne(id);
  // TypeORM 메타데이터 제거
  return moduleSchema.parse(result);
}
```

## Enum 네이밍 규칙

```typescript
// 1. Enum 값 배열 (as const 필수)
export const ROLE_ENUM_VALUE = ['ADMIN_SUPER', 'ADMIN_STAFF'] as const;

// 2. Enum 타입
export type RoleEnumType = typeof ROLE_ENUM_VALUE[number];

// 3. Enum 객체
export const RoleEnum: EnumType<RoleEnumType> = {
  ADMIN_SUPER: 'ADMIN_SUPER',
  ADMIN_STAFF: 'ADMIN_STAFF'
};

// 4. Zod 스키마
export const roleEnumSchema = z.enum(ROLE_ENUM_VALUE);
```

## Nullish 타입 사용

```typescript
// Entity에서
import { Nullish } from '@src/types/utility.type';

@Column({ type: 'varchar', nullable: true })
email: Nullish<string>;

// Zod 스키마에서
export const moduleSchema = z.object({
  email: z.string().email().nullish(), // undefined 또는 null 허용
});
```

## TypeScript Import 규칙

```typescript
// ✅ 타입 전용 import는 import type 사용
import type { CreateModuleInput } from './module.dto';
import type { FC } from 'react';

// ✅ 혼합 import
import React, { type FC } from 'react';
```

## 참고 파일

- Schema 예시: `apps/api/src/module/shop/order/shop.order.schema.ts`
- DTO 예시: `apps/api/src/module/shop/order/shop.order.dto.ts`
