---
name: architecture-database
description: YesTravel 데이터베이스 구조. PostgreSQL 16, TypeORM, Entity 관계, Migration 패턴.
keywords: [데이터베이스, PostgreSQL, TypeORM, Entity, Migration, 테이블, 컬럼, 외래키, 인덱스]
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
| TypeORM 상속 데코레이터 금지 | PostgreSQL INHERITS가 테이블 상속을 담당하므로 TypeORM `@TableInheritance`, `@ChildEntity`를 함께 사용하면 상속 계층과 스키마 정의가 이중 관리되어 마이그레이션·DDL 생성·SELECT 결과가 서로 불일치/충돌할 수 있음 |
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
