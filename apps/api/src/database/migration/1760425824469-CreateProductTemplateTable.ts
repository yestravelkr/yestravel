import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTemplateTable1760425824469
  implements MigrationInterface
{
  name = 'CreateProductTemplateTable1760425824469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Product Template Type 열거형 생성 (현재는 HOTEL만)
    await queryRunner.query(
      `CREATE TYPE "public"."product_template_type_enum" AS ENUM('HOTEL')`
    );

    // Product Template 부모 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "product_template" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "type" "public"."product_template_type_enum" NOT NULL,
        "thumbnail_urls" jsonb NOT NULL DEFAULT '[]',
        "name" character varying(255) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "detail_content" text NOT NULL DEFAULT '',
        "brand_id" integer NOT NULL,
        CONSTRAINT "PK_product_template" PRIMARY KEY ("id")
      )`
    );

    // hotel_template 테이블을 product_template 테이블을 상속받도록 생성
    await queryRunner.query(
      `CREATE TABLE "hotel_template" (
        "base_capacity" integer NOT NULL,
        "max_capacity" integer NOT NULL,
        "check_in_time" time NOT NULL,
        "check_out_time" time NOT NULL,
        "bed_types" jsonb NOT NULL DEFAULT '[]',
        "tags" jsonb NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_hotel_template" PRIMARY KEY ("id")
      ) INHERITS ("product_template")`
    );

    // product_template 테이블에 brand 외래키 제약조건 추가
    await queryRunner.query(
      `ALTER TABLE "product_template" ADD CONSTRAINT "FK_product_template_brand" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // hotel_template 테이블에도 외래키 제약조건 추가 (PostgreSQL 상속 특성상 필요)
    await queryRunner.query(
      `ALTER TABLE "hotel_template" ADD CONSTRAINT "FK_hotel_template_brand" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // 인덱스 추가
    await queryRunner.query(
      `CREATE INDEX "IDX_product_template_type" ON "product_template" ("type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_template_brand_id" ON "product_template" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hotel_template_brand_id" ON "hotel_template" ("brand_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 제거
    await queryRunner.query(`DROP INDEX "IDX_hotel_template_brand_id"`);
    await queryRunner.query(`DROP INDEX "IDX_product_template_brand_id"`);
    await queryRunner.query(`DROP INDEX "IDX_product_template_type"`);

    // 외래키 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "hotel_template" DROP CONSTRAINT "FK_hotel_template_brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_template" DROP CONSTRAINT "FK_product_template_brand"`
    );

    // 테이블 제거
    await queryRunner.query(`DROP TABLE "hotel_template"`);
    await queryRunner.query(`DROP TABLE "product_template"`);

    // Enum 제거
    await queryRunner.query(`DROP TYPE "public"."product_template_type_enum"`);
  }
}
