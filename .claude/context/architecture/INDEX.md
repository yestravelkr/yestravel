---
title: YesTravel 시스템 아키텍처
estimated_tokens: ~250
---

# 시스템 아키텍처

## 기술 스택

| 레이어 | 기술 |
|-------|------|
| **Frontend** | React 18, TanStack Router, tRPC Client, Zustand |
| **Backend** | NestJS 10, tRPC (nestjs-trpc), TypeORM |
| **Database** | PostgreSQL 16 (INHERITS 패턴) |
| **Infra** | Docker, AWS |

## 통신 구조

```
클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service
```

- **Router**: API 엔드포인트, Zod 스키마 검증
- **Controller**: 메시지 핸들러, 트랜잭션 관리
- **Service**: 비즈니스 로직, Repository 접근

## 디렉토리 구조

```
apps/
├── api/                    # NestJS + tRPC 서버
│   └── src/module/
│       ├── backoffice/     # 백오피스 모듈
│       │   └── domain/     # 모든 Entity 위치
│       ├── shop/           # 샵 모듈
│       └── shared/         # 공통 모듈 (RepositoryProvider)
├── backoffice/             # 백오피스 프론트엔드
└── shop/                   # 샵 프론트엔드
packages/
├── api-types/              # tRPC 타입 공유
└── min-design-system/      # 디자인 시스템
```

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

## 상세 문서

- 데이터베이스: `database.md`
- 개발 방법: `.claude/skills/be-development/`, `.claude/skills/fe-development/`
