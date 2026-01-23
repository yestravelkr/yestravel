---
name: backend-index
description: YesTravel 백엔드 기술 스택 및 코딩 규칙. NestJS, tRPC, TypeORM, Zod.
keywords: [백엔드, NestJS, tRPC, TypeORM, Zod, DTO분리, Repository, 트랜잭션, awaitFor금지]
estimated_tokens: ~200
---

# 백엔드 기술 스택

## 기술

| 영역 | 기술 |
|-----|------|
| **Framework** | NestJS 10, TypeScript 5.x |
| **API** | tRPC (nestjs-trpc) |
| **Database** | PostgreSQL 16, TypeORM |
| **Validation** | Zod |

## 코딩 규칙

| 규칙 | 설명 |
|-----|------|
| 한 글자 변수명 금지 | `item`, `product` 등 사용 |
| 함수형 메서드 | `map`, `filter`, `reduce` 사용 |

## 아키텍처 규칙

| 규칙 | 설명 |
|-----|------|
| DTO 분리 | Service 내 interface 금지, `*.dto.ts` 분리 |
| Repository | `TypeOrmModule.forFeature()` 금지 |
| 트랜잭션 | mutation에 `@Transactional` 필수 |
| Entity 위치 | `apps/api/src/module/backoffice/domain/` |
| Router | Module providers에 추가 금지 (자동 발견) |
| tRPC import | `'nestjs-trpc'`에서 import |

## 개발 방법

`.claude/skills/be-development/`
