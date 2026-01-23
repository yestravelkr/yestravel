---
title: 모듈 생성 방법
estimated_tokens: ~300
---

# 모듈 생성 방법

## 생성 순서

### 1. Schema 정의 (`module.schema.ts`)

```typescript
import { z } from 'zod';

export const createModuleInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
});

export const updateModuleInputSchema = createModuleInputSchema.extend({
  id: z.number(),
});
```

### 2. DTO 정의 (`module.dto.ts`)

```typescript
export type CreateModuleInput = z.infer<typeof createModuleInputSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleInputSchema>;
```

### 3. Entity 생성 (`domain/module.entity.ts`)

```typescript
@Entity('module')
export class ModuleEntity extends BaseEntity {
  @Column()
  name: string;
}

export const getModuleRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source).getRepository(ModuleEntity);
```

### 4. RepositoryProvider 등록

```typescript
// repository.provider.ts
get ModuleRepository() {
  return getModuleRepository(this.transaction);
}
```

### 5. Service 구현 (`module.service.ts`)

### 6. Controller 작성 (`module.controller.ts`)

```typescript
@Controller()
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly transactionService: TransactionService // 필수
  ) {}

  @MessagePattern('module.create')
  @Transactional
  async create(data: CreateModuleInput) {
    return this.moduleService.create(data);
  }
}
```

### 7. Router 정의 (`module.router.ts`)

```typescript
@Router({ alias: 'module' })
export class ModuleRouter extends BaseTrpcRouter {
  @Mutation({
    input: z.object({ name: z.string() }),
    output: z.object({ id: z.number() })
  })
  async create(@Input() input: CreateModuleInput) {
    return this.microserviceClient.send('module.create', input);
  }
}
```

### 8. Module 설정 (`module.module.ts`)

```typescript
@Module({
  controllers: [ModuleController],
  providers: [ModuleService], // Router 추가 금지
})
export class ModuleModule {}
```

### 9-11. Migration, Lint

```bash
yarn migration:create src/migration/CreateModule
yarn migration:run
cd apps/api && yarn lint
```
