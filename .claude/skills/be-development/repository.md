---
title: Repository 패턴
estimated_tokens: ~400
---

# Repository 패턴

## RepositoryProvider 사용

```typescript
// ❌ TypeOrmModule.forFeature() 사용 금지
@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
})

// ✅ RepositoryProvider만 사용
@Module({
  providers: [AdminService], // TypeOrmModule 없음
})
```

## Service에서 Repository 접근

```typescript
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

@Injectable()
export class ModuleService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll() {
    return this.repositoryProvider.ModuleRepository.find();
  }

  async findOne(id: number) {
    return this.repositoryProvider.ModuleRepository.findOneOrFail({
      where: { id },
    }).catch(() => {
      throw new NotFoundException('엔티티를 찾을 수 없습니다');
    });
  }
}
```

## 새 Repository 등록

### 1. Entity 파일에 함수 추가

```typescript
// apps/api/src/module/backoffice/domain/module.entity.ts
import { getEntityManager } from '@src/module/shared/transaction/transaction.service';

export const getModuleRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ModuleEntity);
```

### 2. RepositoryProvider에 추가

```typescript
// apps/api/src/module/shared/transaction/repository.provider.ts
get ModuleRepository() {
  return getModuleRepository(this.transaction);
}
```

## Entity 조회 패턴

```typescript
// ❌ 잘못된 방법
const entity = await repository.findOne({ where: { id } });
if (!entity) {
  throw new NotFoundException('엔티티를 찾을 수 없습니다');
}

// ✅ 올바른 방법 - findOneOrFail + catch
const entity = await repository.findOneOrFail({
  where: { id },
}).catch(() => {
  throw new NotFoundException('엔티티를 찾을 수 없습니다');
});
```

## 트랜잭션 관리

```typescript
@Controller()
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly transactionService: TransactionService // ⚠️ 필수
  ) {}

  // Mutation에 @Transactional 필수
  @MessagePattern('moduleName.create')
  @Transactional
  async create(data: CreateModuleInput): Promise<Module> {
    return this.moduleService.create(data);
  }

  // Query는 트랜잭션 불필요
  @MessagePattern('moduleName.findAll')
  async findAll(): Promise<ModuleList> {
    return this.moduleService.findAll();
  }
}
```

## Soft Delete

- BaseEntity에 자동 적용
- `deletedAt: null` 조건 명시 불필요
- `find()`, `findOne()` 메서드는 자동으로 삭제된 레코드 제외

## 참고 파일

- RepositoryProvider: `apps/api/src/module/shared/transaction/repository.provider.ts`
- BaseEntity: `apps/api/src/module/backoffice/domain/base.entity.ts`
- 트랜잭션: `apps/api/src/module/shared/transaction/transaction.service.ts`
