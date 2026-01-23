---
name: Backend-migration
description: TypeORM Migration 작성 방법. 테이블 생성, 컬럼 추가/삭제, 인덱스, 외래키 설정.
keywords: [Migration, TypeORM, 테이블생성, 컬럼추가, 인덱스, 외래키, 롤백, queryRunner]
estimated_tokens: ~400
---

# Migration 작성 방법

## 생성 명령

```bash
# ⚠️ AI가 타임스탬프 생성 금지, 반드시 CLI 사용
yarn migration:create CreateSomeMigration
```

## 실행 명령

```bash
yarn migration:run      # 실행
yarn migration:revert   # 되돌리기
```

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

- Migration 예시: `apps/api/src/migration/`
