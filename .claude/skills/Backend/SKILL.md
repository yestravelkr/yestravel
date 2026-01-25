---
name: Backend
description: YesTravel 백엔드 개발 스킬. Hybrid tRPC + NestJS 마이크로서비스 아키텍처, Repository 패턴, TypeORM, Migration.
keywords: [백엔드, API, Router, Controller, Service, Repository, Migration, Entity, tRPC, NestJS, TypeORM, Zod, DTO]
estimated_tokens: ~600
---

# 백엔드 개발 스킬

## 핵심 역할

- **Hybrid tRPC + NestJS** 마이크로서비스 아키텍처
- **PostgreSQL + TypeORM** 데이터베이스 설계 및 마이그레이션
- **Repository 패턴** 및 트랜잭션 관리
- **Zod 스키마** 기반 타입 안전성 보장

## 통신 흐름

```
클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service
```

## 이 스킬이 필요할 때

- 새 모듈/API 생성
- tRPC Router 작성
- NestJS Controller/Service 작성
- Repository 패턴 적용
- DB Migration 작성
- Entity 상속 구조 설계

## 관련 문서

| 주제 | 위치 |
|-----|------|
| 모듈 생성 순서 | `module-creation.md` |
| Router/Controller | `trpc-nestjs.md` |
| Schema/DTO 패턴 | `schema-dto.md` |
| Repository 패턴 | `repository.md` |
| Entity 상속 (STI) | `entity-inheritance.md` |
| Migration | `migration.md` |
| 로컬 DB 접근/디버깅 | `database.md` |

## 새 모듈 생성 순서

1. Schema 정의 (`module.schema.ts`)
2. DTO 정의 (`module.dto.ts`)
3. Entity 생성 (`domain/module.entity.ts`)
4. Repository 등록 (getModuleRepository + RepositoryProvider)
5. Service 구현 (`module.service.ts`)
6. Controller 작성 (`module.controller.ts` + @Transactional)
7. Router 정의 (`module.router.ts`)
8. Module 설정 (`module.module.ts`)
9. Migration 작성 (`yarn migration:create`)
10. Migration 실행 (`yarn migration:run`)
11. Lint 실행 (`cd apps/api && yarn lint`)

## 설계 원칙

> **참조**: `.claude/skills/Coding/SKILL.md` - SRP, 결합도, 응집도 공통 원칙

### 백엔드 특화 규칙

| 규칙 | 설명 |
|------|------|
| **모듈 간 통신** | Service 직접 주입 대신 MicroserviceClient 사용 |
| **Repository 주입** | 구체 클래스 대신 `getXxxRepository` 토큰 사용 |

### TypeORM 쿼리 규칙

| 규칙 | 설명 |
|------|------|
| **기본 조회** | `find`, `findOne`, `findAndCount` 사용 |
| **QueryBuilder** | `find`로 불가능할 때만 사용 (GROUP BY, 복잡한 JOIN 등) |
| **relations** | LEFT JOIN은 `relations` 옵션 사용 |

```typescript
// ✅ 기본: find + relations
const orders = await repository.find({
  where: { status: 'PAID', campaignId: In([1, 2, 3]) },
  relations: ['product', 'campaign'],
  order: { createdAt: 'DESC' },
  take: 50,
});

// ✅ QueryBuilder 허용: GROUP BY 필요 시
const counts = await repository.createQueryBuilder('ord')
  .select('ord.status', 'status')
  .addSelect('COUNT(*)', 'count')
  .groupBy('ord.status')
  .getRawMany();

// ❌ 단순 조회에 QueryBuilder 사용 금지
const orders = await repository.createQueryBuilder('order')
  .where('order.status = :status', { status: 'PAID' })
  .getMany();
```

### 트랜잭션 규칙

| 규칙 | 설명 |
|------|------|
| **@Transactional 위치** | Mutation(CUD) Controller 메서드에만 적용 |
| **Query 메서드** | @Transactional 불필요 (읽기 전용) |
| **트랜잭션 범위** | 하나의 API 요청 = 하나의 트랜잭션 |

```typescript
@Controller()
export class OrderController {
  constructor(private readonly transactionService: TransactionService) {}

  // ✅ Mutation: @Transactional 필요
  @Transactional()
  @MessagePattern('order.create')
  async create(data: CreateOrderInput) { ... }

  @Transactional()
  @MessagePattern('order.update')
  async update(data: UpdateOrderInput) { ... }

  // ✅ Query: @Transactional 불필요
  @MessagePattern('order.findAll')
  async findAll(data: FindAllOrdersInput) { ... }

  @MessagePattern('order.getById')
  async getById(data: { id: number }) { ... }
}
```

## 필수 준수 사항 (요약)

| 규칙 | 설명 |
|-----|------|
| DTO 분리 | Service 내 interface 금지, `*.dto.ts` 분리 |
| Entity 위치 | `apps/api/src/module/backoffice/domain/` |
| Repository | `TypeOrmModule.forFeature()` 금지, `RepositoryProvider` 사용 |
| 트랜잭션 | Mutation에 `@Transactional`, Controller에 `TransactionService` 주입 |
| Router | Module providers에 추가 금지 (자동 발견) |
| Import | `import type` 사용, tRPC는 `'nestjs-trpc'`에서 import |
| 조회 | `findOneOrFail().catch()` 패턴 사용 |

## 필수 체크리스트

- [ ] DTO가 `*.dto.ts` 파일로 분리되었는가?
- [ ] Entity가 `domain/`에 생성되었는가?
- [ ] Repository가 RepositoryProvider에 등록되었는가?
- [ ] Controller에 TransactionService가 주입되었는가?
- [ ] Mutation에만 @Transactional이 적용되었는가? (Query 제외)
- [ ] 단순 조회에 `find`를 사용했는가? (QueryBuilder 최소화)
- [ ] Router가 Module providers에 없는가?
- [ ] `import type`을 사용했는가?
- [ ] `findOneOrFail`을 사용했는가?
- [ ] Migration을 작성하고 실행했는가?
- [ ] `yarn lint` 실행했는가?

## 주요 명령어

```bash
cd apps/api && yarn dev          # 개발 서버
cd apps/api && yarn lint         # Lint
yarn migration:create src/migration/Name  # Migration 생성
yarn migration:run               # Migration 실행
yarn migration:revert            # Migration 되돌리기
yarn generateEnv                 # 환경 변수 생성
```

## 참고 파일

- Router: `apps/api/src/module/shop/order/shop.order.router.ts`
- Controller: `apps/api/src/module/shop/order/shop.order.controller.ts`
- Service: `apps/api/src/module/shop/order/shop.order.service.ts`
- RepositoryProvider: `apps/api/src/module/shared/transaction/repository.provider.ts`
