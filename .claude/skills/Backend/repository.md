---
name: Backend-repository
description: Repository 패턴 가이드. RepositoryProvider 사용, Entity 조회, 트랜잭션 관리.
keywords: [Repository, RepositoryProvider, findOneOrFail, 트랜잭션, TransactionService, SoftDelete]
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

### @Transactional 데코레이터 사용 시 필수 조건

**⚠️ 중요: `@Transactional` 데코레이터를 사용하는 Controller에는 반드시 `TransactionService`를 주입해야 합니다.**

| 조건 | 필수 여부 | 이유 |
|------|----------|------|
| `TransactionService` 주입 | **필수** | 데코레이터가 내부적으로 트랜잭션 컨텍스트 관리에 사용 |
| 주입하지 않으면 | 런타임 에러 | 트랜잭션이 시작되지 않아 데이터 정합성 문제 발생 |

```typescript
@Controller()
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly transactionService: TransactionService // ⚠️ @Transactional 사용 시 필수 주입
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

### 체크리스트

- [ ] `@Transactional` 데코레이터 사용 시 `TransactionService` 주입 확인
- [ ] Mutation 메서드(create, update, delete)에 `@Transactional` 적용
- [ ] Query 메서드(find, list)는 트랜잭션 불필요

## Soft Delete

- BaseEntity에 자동 적용
- `deletedAt: null` 조건 명시 불필요
- `find()`, `findOne()` 메서드는 자동으로 삭제된 레코드 제외

## 참고 파일

- RepositoryProvider: `apps/api/src/module/shared/transaction/repository.provider.ts`
- BaseEntity: `apps/api/src/module/backoffice/domain/base.entity.ts`
- 트랜잭션: `apps/api/src/module/shared/transaction/transaction.service.ts`
