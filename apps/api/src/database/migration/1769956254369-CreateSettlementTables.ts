import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSettlementTables1769956254369 implements MigrationInterface {
  name = 'CreateSettlementTables1769956254369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. InfluencerSettlement 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "influencer_settlement" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "influencer_id" INTEGER NOT NULL REFERENCES "influencer"("id"),
        "period_year" INTEGER NOT NULL,
        "period_month" INTEGER NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'PENDING',
        "scheduled_at" DATE NOT NULL,
        "completed_at" TIMESTAMP,
        "total_sales" INTEGER NOT NULL DEFAULT 0,
        "total_quantity" INTEGER NOT NULL DEFAULT 0,
        "total_amount" INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_influencer_settlement_influencer_id" ON "influencer_settlement" ("influencer_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_influencer_settlement_status" ON "influencer_settlement" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_influencer_settlement_period" ON "influencer_settlement" ("period_year", "period_month")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_influencer_settlement_period" ON "influencer_settlement" ("influencer_id", "period_year", "period_month")`
    );

    // 2. BrandSettlement 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "brand_settlement" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "brand_id" INTEGER NOT NULL REFERENCES "brand"("id"),
        "period_year" INTEGER NOT NULL,
        "period_month" INTEGER NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'PENDING',
        "scheduled_at" DATE NOT NULL,
        "completed_at" TIMESTAMP,
        "total_sales" INTEGER NOT NULL DEFAULT 0,
        "total_quantity" INTEGER NOT NULL DEFAULT 0,
        "total_amount" INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_brand_settlement_brand_id" ON "brand_settlement" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brand_settlement_status" ON "brand_settlement" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brand_settlement_period" ON "brand_settlement" ("period_year", "period_month")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_brand_settlement_period" ON "brand_settlement" ("brand_id", "period_year", "period_month")`
    );

    // 3. Order 테이블에 settlement_id 추가
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN "influencer_settlement_id" INTEGER`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_influencer_settlement" FOREIGN KEY ("influencer_settlement_id") REFERENCES "influencer_settlement"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_influencer_settlement_id" ON "order" ("influencer_settlement_id")`
    );

    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN "brand_settlement_id" INTEGER`
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_brand_settlement" FOREIGN KEY ("brand_settlement_id") REFERENCES "brand_settlement"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_brand_settlement_id" ON "order" ("brand_settlement_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Order 테이블에서 settlement_id 제거
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_brand_settlement"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_order_brand_settlement_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN IF EXISTS "brand_settlement_id"`
    );

    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_influencer_settlement"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_order_influencer_settlement_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN IF EXISTS "influencer_settlement_id"`
    );

    // 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_settlement"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "influencer_settlement"`);
  }
}
