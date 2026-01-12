---
name: be-development
description: YesTravel 백엔드 개발 스킬. 모듈 생성, Router/Controller/Service 작성, Repository 패턴, Migration.
estimated_tokens: ~400
---

# 백엔드 개발 스킬

## 이 스킬이 필요할 때

- 새 모듈/API 생성
- tRPC Router 작성
- NestJS Controller/Service 작성
- Repository 패턴 적용
- DB Migration 작성

## 관련 문서

| 주제 | 위치 |
|-----|------|
| 모듈 생성 순서 | `module-creation.md` |
| Router/Controller | `trpc-nestjs.md` |
| Schema/DTO 패턴 | `schema-dto.md` |
| Repository 패턴 | `repository.md` |
| Migration | `migration.md` |

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

## 필수 체크리스트

- [ ] DTO가 `*.dto.ts` 파일로 분리되었는가?
- [ ] Entity가 `domain/`에 생성되었는가?
- [ ] Repository가 RepositoryProvider에 등록되었는가?
- [ ] Controller에 TransactionService가 주입되었는가?
- [ ] Mutation에 @Transactional이 적용되었는가?
- [ ] Router가 Module providers에 없는가?
- [ ] `yarn lint` 실행했는가?

## 주요 명령어

```bash
cd apps/api && yarn dev          # 개발 서버
cd apps/api && yarn lint         # Lint
yarn migration:create src/migration/Name  # Migration 생성
yarn migration:run               # Migration 실행
```
