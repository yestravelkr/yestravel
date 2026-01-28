import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorProductInheritance1768531200001 implements MigrationInterface {
  name = 'RefactorProductInheritance1768531200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. hotel_product 테이블 DROP (INHERITS 구조 제거)
    await queryRunner.query(`DROP TABLE IF EXISTS "hotel_product" CASCADE`);

    // 2. delivery_product 테이블 DROP (INHERITS 구조 제거)
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_product" CASCADE`);

    // 3. eticket_product 테이블 DROP (INHERITS 구조 제거)
    await queryRunner.query(`DROP TABLE IF EXISTS "eticket_product" CASCADE`);

    // 4. product 테이블에 hotel 전용 컬럼 추가 (nullable)
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN "base_capacity" integer,
      ADD COLUMN "max_capacity" integer,
      ADD COLUMN "check_in_time" time,
      ADD COLUMN "check_out_time" time,
      ADD COLUMN "bed_types" jsonb DEFAULT '[]',
      ADD COLUMN "tags" jsonb DEFAULT '[]'
    `);

    // 5. product 테이블에 delivery 전용 컬럼 추가 (nullable)
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN "delivery_delivery_fee_type" "public"."delivery_fee_type_enum",
      ADD COLUMN "delivery_delivery_fee" integer DEFAULT 0,
      ADD COLUMN "delivery_free_delivery_min_amount" integer DEFAULT 0,
      ADD COLUMN "delivery_return_delivery_fee" integer DEFAULT 0,
      ADD COLUMN "delivery_exchange_delivery_fee" integer DEFAULT 0,
      ADD COLUMN "delivery_remote_area_extra_fee" integer DEFAULT 0,
      ADD COLUMN "delivery_jeju_extra_fee" integer DEFAULT 0,
      ADD COLUMN "delivery_is_jeju_restricted" boolean DEFAULT false,
      ADD COLUMN "delivery_is_remote_island_restricted" boolean DEFAULT false,
      ADD COLUMN "exchange_return_info" text DEFAULT '',
      ADD COLUMN "product_info_notice" text DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. product 테이블에서 delivery 전용 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP COLUMN IF EXISTS "delivery_delivery_fee_type",
      DROP COLUMN IF EXISTS "delivery_delivery_fee",
      DROP COLUMN IF EXISTS "delivery_free_delivery_min_amount",
      DROP COLUMN IF EXISTS "delivery_return_delivery_fee",
      DROP COLUMN IF EXISTS "delivery_exchange_delivery_fee",
      DROP COLUMN IF EXISTS "delivery_remote_area_extra_fee",
      DROP COLUMN IF EXISTS "delivery_jeju_extra_fee",
      DROP COLUMN IF EXISTS "delivery_is_jeju_restricted",
      DROP COLUMN IF EXISTS "delivery_is_remote_island_restricted",
      DROP COLUMN IF EXISTS "exchange_return_info",
      DROP COLUMN IF EXISTS "product_info_notice"
    `);

    // 2. product 테이블에서 hotel 전용 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP COLUMN IF EXISTS "base_capacity",
      DROP COLUMN IF EXISTS "max_capacity",
      DROP COLUMN IF EXISTS "check_in_time",
      DROP COLUMN IF EXISTS "check_out_time",
      DROP COLUMN IF EXISTS "bed_types",
      DROP COLUMN IF EXISTS "tags"
    `);

    // 3. hotel_product 테이블 복구 (INHERITS)
    await queryRunner.query(`
      CREATE TABLE "hotel_product"
      (
        "base_capacity" integer NOT NULL DEFAULT 0,
        "max_capacity" integer NOT NULL DEFAULT 0,
        "check_in_time" time NOT NULL DEFAULT '15:00:00',
        "check_out_time" time NOT NULL DEFAULT '11:00:00',
        "bed_types" jsonb NOT NULL DEFAULT '[]',
        "tags" jsonb NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_hotel_product" PRIMARY KEY ("id")
      ) INHERITS ("product")
    `);

    // 4. delivery_product 테이블 복구 (INHERITS)
    await queryRunner.query(`
      CREATE TABLE "delivery_product" (
        "delivery_delivery_fee_type" "public"."delivery_fee_type_enum" NOT NULL,
        "delivery_delivery_fee" integer NOT NULL DEFAULT 0,
        "delivery_free_delivery_min_amount" integer NOT NULL DEFAULT 0,
        "delivery_return_delivery_fee" integer NOT NULL DEFAULT 0,
        "delivery_exchange_delivery_fee" integer NOT NULL DEFAULT 0,
        "delivery_remote_area_extra_fee" integer NOT NULL DEFAULT 0,
        "delivery_jeju_extra_fee" integer NOT NULL DEFAULT 0,
        "delivery_is_jeju_restricted" boolean NOT NULL DEFAULT false,
        "delivery_is_remote_island_restricted" boolean NOT NULL DEFAULT false,
        "exchange_return_info" text NOT NULL DEFAULT '',
        "product_info_notice" text NOT NULL DEFAULT '',
        CONSTRAINT "PK_delivery_product" PRIMARY KEY ("id")
      ) INHERITS ("product")
    `);

    // 5. eticket_product 테이블 복구 (INHERITS)
    await queryRunner.query(`
      CREATE TABLE "eticket_product" (
        CONSTRAINT "PK_eticket_product" PRIMARY KEY ("id")
      ) INHERITS ("product")
    `);

    // 6. 외래키 제약조건 복구
    await queryRunner.query(`
      ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 7. 인덱스 복구
    await queryRunner.query(`
      CREATE INDEX "IDX_hotel_product_brand_id" ON "hotel_product" ("brand_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_delivery_product_brand_id" ON "delivery_product" ("brand_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_eticket_product_brand_id" ON "eticket_product" ("brand_id")
    `);
  }
}
