import { MigrationInterface, QueryRunner } from 'typeorm';

export class Order1766930343238 implements MigrationInterface {
  name = 'Order1766930343238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. payment 테이블 생성
    await queryRunner.query(`
        CREATE TABLE "payment"
        (
            "id"          SERIAL PRIMARY KEY,
            "created_at"  TIMESTAMP    NOT NULL DEFAULT now(),
            "updated_at"  TIMESTAMP    NOT NULL DEFAULT now(),
            "paid_at"     TIMESTAMP WITH TIME ZONE,
            "pg_provider" VARCHAR(50)  NOT NULL,
            "pg_raw_data" JSONB,
            "paid_amount" INTEGER      NOT NULL,
            "now_amount"  INTEGER      NOT NULL,
            "imp_uid"     VARCHAR(100) NOT NULL,
            "order_id"    INTEGER      NOT NULL
        )
    `);

    // payment 인덱스
    await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_payment_imp_uid" ON "payment" ("imp_uid")
    `);
    await queryRunner.query(`
        CREATE INDEX "IDX_payment_paid_at" ON "payment" ("paid_at")
    `);

    // 2. order 테이블 생성 (부모 테이블)
    await queryRunner.query(`
        CREATE TABLE "order"
        (
            "id"                      SERIAL PRIMARY KEY,
            "created_at"              TIMESTAMP   NOT NULL DEFAULT now(),
            "updated_at"              TIMESTAMP   NOT NULL DEFAULT now(),
            "status"                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            "customer_name"           VARCHAR(20) NOT NULL,
            "customer_phone"          VARCHAR(20) NOT NULL,
            "shipping_address"        VARCHAR(500),
            "shipping_address_detail" VARCHAR(200),
            "shipping_postal_code"    VARCHAR(10),
            "product_id"              INTEGER     NOT NULL,
            "order_option_snapshot"   JSONB       NOT NULL,
            "total_amount"            INTEGER     NOT NULL,
            "influencer_id"           INTEGER     NOT NULL,
            "campaign_id"             INTEGER     NOT NULL
        )
    `);

    // order 인덱스
    await queryRunner.query(`
        CREATE INDEX "IDX_order_status" ON "order" ("status")
    `);
    await queryRunner.query(`
        CREATE INDEX "IDX_order_product_id" ON "order" ("product_id")
    `);
    await queryRunner.query(`
        CREATE INDEX "IDX_order_influencer_id" ON "order" ("influencer_id")
    `);
    await queryRunner.query(`
        CREATE INDEX "IDX_order_campaign_id" ON "order" ("campaign_id")
    `);

    // order FK 제약조건
    await queryRunner.query(`
        ALTER TABLE "order"
            ADD CONSTRAINT "FK_order_product_id"
                FOREIGN KEY ("product_id") REFERENCES "product" ("id")
    `);
    await queryRunner.query(`
        ALTER TABLE "order"
            ADD CONSTRAINT "FK_order_influencer_id"
                FOREIGN KEY ("influencer_id") REFERENCES "influencer" ("id")
    `);
    await queryRunner.query(`
        ALTER TABLE "order"
            ADD CONSTRAINT "FK_order_campaign_id"
                FOREIGN KEY ("campaign_id") REFERENCES "campaign" ("id")
    `);

    // payment FK 제약조건 (order 테이블 생성 후)
    await queryRunner.query(`
        ALTER TABLE "payment"
            ADD CONSTRAINT "FK_payment_order_id"
                FOREIGN KEY ("order_id") REFERENCES "order" ("id")
    `);

    // 3. hotel_order 테이블 생성 (order 테이블 상속)
    await queryRunner.query(`
        CREATE TABLE "hotel_order"
        (
            "check_in_date"  DATE NOT NULL,
            "check_out_date" DATE NOT NULL
        ) INHERITS ("order")
    `);

    // 3. product_type_enum 타입 생성 (이미 존재하면 건너뜀)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "product_type_enum" AS ENUM ('HOTEL', 'E-TICKET', 'DELIVERY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 4. 새로운 tmp_order 테이블 생성 (독립 테이블)
    await queryRunner.query(`
      CREATE TABLE "tmp_order"
      (
        "id"         SERIAL PRIMARY KEY,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "type"       "product_type_enum" NOT NULL,
        "raw"        JSONB NOT NULL
      )
    `);

    // 5. 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX "IDX_tmp_order_type" ON "tmp_order" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. tmp_order 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tmp_order_type"`);

    // 2. tmp_order 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "tmp_order"`);

    // 3. hotel_order 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "hotel_order"`);

    // 4. payment FK 삭제
    await queryRunner.query(`
        ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_payment_order_id"
    `);

    // 5. order FK 삭제
    await queryRunner.query(`
        ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_campaign_id"
    `);
    await queryRunner.query(`
        ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_influencer_id"
    `);
    await queryRunner.query(`
        ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_product_id"
    `);

    // 6. order 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_campaign_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_influencer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_status"`);

    // 7. order 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "order"`);

    // 8. payment 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_paid_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_imp_uid"`);

    // 9. payment 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "payment"`);
  }
}
