---
name: Backend-migration
description: TypeORM Migration 작성 방법. 테이블 생성, 컬럼 추가/삭제, 인덱스, 외래키 설정.
keywords: [Migration, TypeORM, 테이블생성, 컬럼추가, 인덱스, 외래키, 롤백, queryRunner, migration:create]
estimated_tokens: ~600
---

# Migration 작성 방법

## 필수 워크플로우

### Step 1: Migration 파일 생성 (필수)

```bash
cd apps/api
yarn migration:create MigrationName
```

**이 명령은 다음을 자동으로 수행합니다:**
- 현재 시간 기준 타임스탬프 생성 (예: `1770123456789`)
- 파일 생성: `src/database/migration/1770123456789-MigrationName.ts`
- 클래스 생성: `MigrationName1770123456789`

### Step 2: 생성된 파일에 Migration 내용 작성

```typescript
// apps/api/src/database/migration/1770123456789-MigrationName.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1770123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 여기에 Migration 쿼리 작성
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 여기에 Rollback 쿼리 작성
  }
}
```

### Step 3: Migration 실행

```bash
yarn migration:run      # 실행
yarn migration:revert   # 되돌리기 (가장 최근 1개)
```

## 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| 테이블명 | snake_case | `tmp_order`, `hotel_template` |
| 컬럼명 | snake_case | `member_id`, `created_at` |
| 제약조건명 | PK_/FK_/UQ_/IDX_ 접두사 + snake_case | `PK_hotel_template`, `FK_order_member` |

**컬럼명은 반드시 snake_case로 작성:**
```typescript
// ✅ 올바른 예
await queryRunner.query(`ALTER TABLE tmp_order ADD COLUMN "member_id" integer NOT NULL`);

// ❌ 잘못된 예 (camelCase 사용)
await queryRunner.query(`ALTER TABLE tmp_order ADD COLUMN "memberId" integer NOT NULL`);
```

> TypeORM은 엔티티의 camelCase 프로퍼티를 자동으로 snake_case 컬럼명으로 변환합니다.
> Migration에서 camelCase로 컬럼을 생성하면 엔티티와 매핑되지 않습니다.

## 금지 사항

| 금지 | 이유 |
|------|------|
| 수동으로 타임스탬프 생성 | 기존 migration과 순서 충돌 발생 |
| 파일 직접 생성 | 타임스탬프 형식 오류 위험 |
| 파일명 수동 수정 | 실행 순서 꼬임 발생 |
| 컬럼명에 camelCase 사용 | TypeORM 엔티티 매핑 실패 |

**왜 순서가 중요한가?**
- TypeORM은 파일명의 타임스탬프 순서대로 migration 실행
- 기존 DB에 이미 실행된 migration 기록이 있음 (`migrations` 테이블)
- 타임스탬프가 과거로 설정되면 "이미 실행됨"으로 판단하여 건너뜀
- 타임스탬프가 기존 migration 사이에 끼면 실행 순서 충돌

## INHERITS 테이블 생성 순서

### 1. 부모 테이블 생성

```typescript
await queryRunner.query(`
  CREATE TABLE "product_template" (
    "id" SERIAL PRIMARY KEY,
    "type" varchar NOT NULL,
    "name" varchar NOT NULL,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now(),
    "deleted_at" TIMESTAMP
  )
`);
```

### 2. 자식 테이블 생성 (INHERITS)

```typescript
await queryRunner.query(`
  CREATE TABLE "hotel_template" (
    "base_capacity" integer NOT NULL,
    "check_in_time" varchar NOT NULL
  ) INHERITS ("product_template")
`);
```

### 3. 자식 테이블에 PK/인덱스 추가

```typescript
// INHERITS는 PK를 상속하지 않으므로 직접 추가
await queryRunner.query(`
  ALTER TABLE "hotel_template"
  ADD CONSTRAINT "PK_hotel_template" PRIMARY KEY ("id")
`);
```

### 4. 외래키 추가 (각 테이블 개별)

```typescript
await queryRunner.query(`
  ALTER TABLE "hotel_template"
  ADD CONSTRAINT "FK_hotel_category"
  FOREIGN KEY ("category_id") REFERENCES "category"("id")
`);
```

## 컬럼 추가/삭제

**부모 테이블에만** 수행 (자식에 자동 상속):

```typescript
// 컬럼 추가
await queryRunner.query(`
  ALTER TABLE "product_template"
  ADD COLUMN "description" text
`);

// 컬럼 삭제
await queryRunner.query(`
  ALTER TABLE "product_template"
  DROP COLUMN "description"
`);
```

## Rollback (down 메서드)

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE "hotel_template"`);
  await queryRunner.query(`DROP TABLE "product_template"`);
}
```

## 참고 파일

- Migration 위치: `apps/api/src/database/migration/`
- Migration 설정: `apps/api/migrationConfig.ts`
- 스크립트 정의: `apps/api/package.json` (migration:* 스크립트)
