---
title: tRPC + NestJS 통합 가이드
estimated_tokens: ~800
---

# tRPC + NestJS Hybrid 아키텍처

## 모듈 파일 구조

```
module/
├── module.router.ts      # tRPC 엔드포인트 (@Router)
├── module.controller.ts  # 메시지 핸들러 (@MessagePattern)
├── module.service.ts     # 비즈니스 로직
├── module.module.ts      # NestJS 모듈
├── module.schema.ts      # Zod 스키마
└── module.dto.ts         # DTO 타입 정의
```

## Router 작성 규칙

```typescript
// ⚠️ 반드시 'nestjs-trpc'에서 import
import { Router, Query, Mutation, Input } from 'nestjs-trpc';

@Router({ alias: 'moduleName' })
export class ModuleRouter extends BaseTrpcRouter {
  // ✅ z.object()를 직접 사용 (외부 스키마 import 금지)
  @Mutation({
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }),
    output: z.object({
      id: z.number(),
      message: z.string(),
    })
  })
  async create(@Input() input: { name: string; email: string }) {
    return this.microserviceClient.send('moduleName.create', input);
  }
}
```

**핵심 규칙**:
- Router는 Module의 providers에 추가하지 않음 (자동 발견)
- 스키마는 Router 파일 내에서 직접 정의

## Controller 작성 규칙

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/decorator/transactional.decorator';

@Controller()
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly transactionService: TransactionService // ⚠️ 필수
  ) {}

  // ✅ Mutation에는 @Transactional 필수
  @MessagePattern('moduleName.create')
  @Transactional
  async create(data: CreateModuleInput): Promise<Module> {
    const result = await this.moduleService.create(data);
    // 응답 포맷팅 (TypeORM 메타데이터 제거)
    return moduleOutputSchema.parse(result);
  }

  // Query는 트랜잭션 불필요
  @MessagePattern('moduleName.findAll')
  async findAll(): Promise<ModuleList> {
    return this.moduleService.findAll();
  }
}
```

**메시지 패턴**: `moduleName.methodName` 형식 사용

## Schema & DTO 패턴

```typescript
// module.schema.ts - Zod 스키마
export const createModuleInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
});

// Update = Create.extend
export const updateModuleInputSchema = createModuleInputSchema.extend({
  id: z.number(),
});

// module.dto.ts - TypeScript 타입
export type CreateModuleInput = z.infer<typeof createModuleInputSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleInputSchema>;
```

**DTO 규칙**: Service 파일에 interface 직접 정의 금지, `*.dto.ts`로 분리

## Module 설정

```typescript
@Module({
  imports: [
    // ❌ TypeOrmModule.forFeature([Entity]) 사용 금지
  ],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    // ❌ ModuleRouter 추가 금지 (자동 발견)
  ],
})
export class ModuleModule {}
```

## 새 모듈 생성 순서

1. Schema 정의 (`module.schema.ts`)
2. DTO 정의 (`module.dto.ts`)
3. Entity 생성 (`domain/module.entity.ts`)
4. Repository 등록 (getModuleRepository + RepositoryProvider)
5. Service 구현 (`module.service.ts`)
6. Controller 작성 (`module.controller.ts` + @Transactional)
7. Router 정의 (`module.router.ts`)
8. Module 설정 (`module.module.ts`)
9. Migration 실행 (`yarn migration:run`)
10. Lint 실행 (`cd apps/api && yarn lint`)

## 참고 파일

- Router 예시: `apps/api/src/module/shop/order/shop.order.router.ts`
- Controller 예시: `apps/api/src/module/shop/order/shop.order.controller.ts`
- Service 예시: `apps/api/src/module/shop/order/shop.order.service.ts`
