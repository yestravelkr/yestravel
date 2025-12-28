import { MigrationInterface, QueryRunner } from 'typeorm';

export class skuProductRelation1766907795903 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 FK 제약 제거 (sku 테이블)
    await queryRunner.query(
      `ALTER TABLE "sku" DROP CONSTRAINT IF EXISTS "FK_sku_product_template"`
    );

    // 2. 기존 인덱스 제거 (sku 테이블)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sku_code"`);

    // 3. product_template_id 컬럼 제거 (sku 테이블)
    // INHERITS 구조이므로 부모 테이블에서만 제거하면 자식(hotel_sku)에서도 제거됨
    await queryRunner.query(
      `ALTER TABLE "sku" DROP COLUMN IF EXISTS "product_template_id"`
    );

    // 4. product_id 컬럼 추가 (sku 테이블)
    // INHERITS 구조이므로 부모 테이블에 추가하면 자식(hotel_sku)에도 자동 상속
    await queryRunner.query(
      `ALTER TABLE "sku" ADD COLUMN "product_id" integer NOT NULL DEFAULT 0`
    );

    // 5. product_id FK 제약 추가 (sku 테이블)
    await queryRunner.query(
      `ALTER TABLE "sku" ADD CONSTRAINT "FK_sku_product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE`
    );

    // 7. 새 인덱스 추가 (sku 테이블 - product_id + sku_code unique)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sku_code" ON "sku" ("product_id", "sku_code")`
    );

    // 8. 새 인덱스 추가 (hotel_sku 테이블 - product_id + check_in_date unique)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_hotel_sku_product_date" ON "hotel_sku" ("product_id", "check_in_date")`
    );

    // 9. DEFAULT 제거 (sku 테이블)
    // INHERITS 구조이므로 부모에서 제거하면 자식도 제거됨
    await queryRunner.query(
      `ALTER TABLE "sku" ALTER COLUMN "product_id" DROP DEFAULT`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. FK 제약 제거
    await queryRunner.query(
      `ALTER TABLE "hotel_sku" DROP CONSTRAINT IF EXISTS "FK_hotel_sku_product"`
    );
    await queryRunner.query(
      `ALTER TABLE "sku" DROP CONSTRAINT IF EXISTS "FK_sku_product"`
    );

    // 2. 인덱스 제거
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_hotel_sku_product_date"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sku_code"`);

    // 3. product_id 컬럼 제거 (sku 테이블)
    // INHERITS 구조이므로 부모에서 제거하면 자식(hotel_sku)에서도 제거됨
    await queryRunner.query(
      `ALTER TABLE "sku" DROP COLUMN IF EXISTS "product_id"`
    );

    // 4. product_template_id 컬럼 복원 (sku 테이블)
    await queryRunner.query(
      `ALTER TABLE "sku" ADD COLUMN "product_template_id" integer`
    );

    // 5. FK 제약 복원 (sku 테이블)
    await queryRunner.query(
      `ALTER TABLE "sku" ADD CONSTRAINT "FK_sku_product_template" FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE CASCADE`
    );

    // 6. hotel_sku에도 FK 제약 복원
    await queryRunner.query(
      `ALTER TABLE "hotel_sku" ADD CONSTRAINT "FK_hotel_sku_product_template" FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE CASCADE`
    );

    // 7. 인덱스 복원
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sku_code" ON "sku" ("product_template_id", "sku_code")`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_hotel_sku_template_date" ON "hotel_sku" ("product_template_id", "check_in_date")`
    );
  }
}
