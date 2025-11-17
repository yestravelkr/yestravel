import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTables1763341675534 implements MigrationInterface {
  name = 'CreateProductTables1763341675534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum 타입 생성
    await queryRunner.query(
      `CREATE TYPE "public"."product_type_enum" AS ENUM('HOTEL', 'E-TICKET', 'DELIVERY')`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."product_status_enum" AS ENUM('VISIBLE', 'HIDDEN', 'SOLD_OUT')`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."delivery_fee_type_enum" AS ENUM('PAID', 'CONDITIONAL_FREE', 'FREE')`
    );

    // 2. product 부모 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "product" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "type" "public"."product_type_enum" NOT NULL,
        "product_template_id" integer,
        "campaign_id" integer,
        "thumbnail_urls" jsonb NOT NULL DEFAULT '[]',
        "name" character varying NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "detail_content" text NOT NULL DEFAULT '',
        "brand_id" integer NOT NULL,
        "use_calendar" boolean NOT NULL DEFAULT false,
        "use_stock" boolean NOT NULL DEFAULT false,
        "use_options" boolean NOT NULL DEFAULT false,
        "price" integer NOT NULL,
        "status" "public"."product_status_enum" NOT NULL DEFAULT 'VISIBLE',
        "display_order" integer,
        CONSTRAINT "PK_product" PRIMARY KEY ("id")
      )`
    );

    // 3. hotel_product 테이블 생성 (INHERITS product)
    await queryRunner.query(
      `CREATE TABLE "hotel_product" (
        "base_capacity" integer NOT NULL,
        "max_capacity" integer NOT NULL,
        "check_in_time" time NOT NULL,
        "check_out_time" time NOT NULL,
        "bed_types" jsonb NOT NULL DEFAULT '[]',
        "tags" jsonb NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_hotel_product" PRIMARY KEY ("id")
      ) INHERITS ("product")`
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

    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
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

    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_campaign"
       FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
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
    await queryRunner.query(`DROP TABLE "hotel_product"`);
    await queryRunner.query(`DROP TABLE "product"`);

    // Enum 제거
    await queryRunner.query(`DROP TYPE "public"."delivery_fee_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_type_enum"`);
  }
}
