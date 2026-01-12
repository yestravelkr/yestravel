---
title: 데이터베이스 구조
estimated_tokens: ~300
---

# 데이터베이스 구조

## 기술 스택

- **DBMS**: PostgreSQL 16
- **ORM**: TypeORM
- **상속 패턴**: PostgreSQL INHERITS

## PostgreSQL INHERITS 구조

부모-자식 테이블 상속을 사용:

```
product_template (부모)
├── hotel_template (자식) - INHERITS product_template
├── goods_template (자식) - INHERITS product_template
└── ticket_template (자식) - INHERITS product_template
```

**특성:**
- 자식 테이블은 부모 컬럼을 자동 상속
- 부모 테이블 조회 시 모든 자식 데이터 포함
- 컬럼 추가/삭제는 부모 테이블에만 수행 (자동 상속)

## INHERITS 제약사항

| 제약 | 이유 |
|-----|------|
| TypeORM 상속 데코레이터 금지 | `@TableInheritance`, `@ChildEntity` 충돌 |
| 부모 테이블 QueryBuilder 금지 | INHERITS는 QueryBuilder 미지원 |
| 부모 테이블 FK 참조 금지 | INHERITS 특성상 FK 불가 |

## Entity 위치

모든 Entity는 `apps/api/src/module/backoffice/domain/`에 생성

## Soft Delete

- BaseEntity에 자동 적용
- `deletedAt: null` 조건 명시 불필요
- `find()` 메서드는 자동으로 삭제된 레코드 제외

## Repository 패턴

- `TypeOrmModule.forFeature()` 사용 금지
- `RepositoryProvider`만 사용

## 개발 방법

- 작성법: `.claude/skills/be-development/repository.md`
- Migration: `.claude/skills/be-development/migration.md`
