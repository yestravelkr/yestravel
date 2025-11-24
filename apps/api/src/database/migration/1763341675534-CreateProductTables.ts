import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTables1763341675534 implements MigrationInterface {
  name = 'CreateProductTables1763341675534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum 타입 수정 (HOTEL에서 확장)
    await queryRunner.query(
      `ALTER TYPE "public"."product_type_enum" ADD VALUE 'E-TICKET'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."product_type_enum" ADD VALUE 'DELIVERY'`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."product_status_enum" AS ENUM('VISIBLE', 'HIDDEN', 'SOLD_OUT')`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."delivery_fee_type_enum" AS ENUM('PAID', 'CONDITIONAL_FREE', 'FREE')`
    );

    // 2. product 부모 테이블 컬럼 추가
    // 기존 테이블: id, created_at, updated_at, name, price, type, campaign_id
    // 추가 컬럼들
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "product_template_id" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "thumbnail_urls" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "description" text NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "detail_content" text NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "brand_id" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "use_calendar" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "use_stock" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "use_options" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "status" "public"."product_status_enum" NOT NULL DEFAULT 'VISIBLE'`
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "display_order" integer`
    );

    // campaign_id UNIQUE 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "UQ_product_campaign"`
    );

    // 3. hotel_product 테이블 컬럼 추가
    // 기존 테이블: hotel_name, address (INHERITS product)
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "base_capacity" integer NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "max_capacity" integer NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "check_in_time" time NOT NULL DEFAULT '15:00:00'`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "check_out_time" time NOT NULL DEFAULT '11:00:00'`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "bed_types" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD COLUMN "tags" jsonb NOT NULL DEFAULT '[]'`
    );

    // 4. delivery_product 테이블 생성 (INHERITS product)
    await queryRunner.query(
      `CREATE TABLE "delivery_product" (
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
      ) INHERITS ("product")`
    );

    // 5. eticket_product 테이블 생성 (INHERITS product)
    await queryRunner.query(
      `CREATE TABLE "eticket_product" (
        CONSTRAINT "PK_eticket_product" PRIMARY KEY ("id")
      ) INHERITS ("product")`
    );

    // 6. product_categories 조인 테이블 생성 (Many-to-Many)
    await queryRunner.query(
      `CREATE TABLE "product_categories" (
        "product_id" integer NOT NULL,
        "category_id" integer NOT NULL,
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("product_id", "category_id")
      )`
    );

    // 7. 외래키 제약조건 추가 - product
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    // 8. 외래키 제약조건 추가 - hotel_product
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    // 9. 외래키 제약조건 추가 - delivery_product
    await queryRunner.query(
      `ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "delivery_product" ADD CONSTRAINT "FK_delivery_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    // 10. 외래키 제약조건 추가 - eticket_product
    await queryRunner.query(
      `ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_brand"
       FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_product_template"
       FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "eticket_product" ADD CONSTRAINT "FK_eticket_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    // 11. 외래키 제약조건 추가 - product_categories
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_product"
       FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_category"
       FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // 12. 인덱스 추가
    await queryRunner.query(
      `CREATE INDEX "IDX_product_type" ON "product" ("type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_brand_id" ON "product" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_status" ON "product" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_product_template_id" ON "product" ("product_template_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_campaign_id" ON "product" ("campaign_id")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_hotel_product_brand_id" ON "hotel_product" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_delivery_product_brand_id" ON "delivery_product" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eticket_product_brand_id" ON "eticket_product" ("brand_id")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_product_id" ON "product_categories" ("product_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_category_id" ON "product_categories" ("category_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 제거
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_categories_category_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_categories_product_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eticket_product_brand_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_delivery_product_brand_id"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_hotel_product_brand_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_campaign_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_product_template_id"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_product_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_brand_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_type"`);

    // 외래키 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_product_categories_category"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_product_categories_product"`
    );
    await queryRunner.query(
      `ALTER TABLE "eticket_product" DROP CONSTRAINT "FK_eticket_product_campaign"`
    );
    await queryRunner.query(
      `ALTER TABLE "eticket_product" DROP CONSTRAINT "FK_eticket_product_product_template"`
    );
    await queryRunner.query(
      `ALTER TABLE "eticket_product" DROP CONSTRAINT "FK_eticket_product_brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_product" DROP CONSTRAINT "FK_delivery_product_campaign"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_product" DROP CONSTRAINT "FK_delivery_product_product_template"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_product" DROP CONSTRAINT "FK_delivery_product_brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP CONSTRAINT "FK_hotel_product_campaign"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP CONSTRAINT "FK_hotel_product_product_template"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP CONSTRAINT "FK_hotel_product_brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_campaign"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_product_template"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_brand"`
    );

    // 테이블 제거
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "eticket_product"`);
    await queryRunner.query(`DROP TABLE "delivery_product"`);

    // hotel_product 테이블 컬럼 제거 (원래 상태로 복원)
    await queryRunner.query(`ALTER TABLE "hotel_product" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN "bed_types"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN "check_out_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN "check_in_time"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN "max_capacity"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN "base_capacity"`
    );

    // product 테이블 컬럼 제거 (원래 상태로 복원)
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "display_order"`
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "use_options"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "use_stock"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "use_calendar"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand_id"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "detail_content"`
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "thumbnail_urls"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "product_template_id"`
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "deleted_at"`);

    // UNIQUE 제약조건 복원
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "UQ_product_campaign" UNIQUE ("campaign_id")`
    );

    // Enum 제거
    await queryRunner.query(`DROP TYPE "public"."delivery_fee_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
  }
}
