import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorOrderInheritance1768531200000
  implements MigrationInterface
{
  name = 'RefactorOrderInheritance1768531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. hotel_order 테이블 DROP (INHERITS 구조 제거)
    await queryRunner.query(`DROP TABLE IF EXISTS "hotel_order"`);

    // 2. order 테이블에 type 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN "type" "product_type_enum" NOT NULL DEFAULT 'HOTEL'
    `);

    // 3. order 테이블에 check_in_date, check_out_date 컬럼 추가 (nullable)
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN "check_in_date" DATE,
      ADD COLUMN "check_out_date" DATE
    `);

    // 4. type 인덱스 추가
    await queryRunner.query(`
      CREATE INDEX "IDX_order_type" ON "order" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. type 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_type"`);

    // 2. check_in_date, check_out_date 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "order"
      DROP COLUMN IF EXISTS "check_in_date",
      DROP COLUMN IF EXISTS "check_out_date"
    `);

    // 3. type 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "order" DROP COLUMN IF EXISTS "type"
    `);

    // 4. hotel_order 테이블 복구 (INHERITS)
    await queryRunner.query(`
      CREATE TABLE "hotel_order"
      (
        "check_in_date"  DATE NOT NULL,
        "check_out_date" DATE NOT NULL
      ) INHERITS ("order")
    `);
  }
}
