import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryAndEticketTemplates1760425824470
  implements MigrationInterface
{
  name = 'AddDeliveryAndEticketTemplates1760425824470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Product Template Type enum에 DELIVERY, E-TICKET 추가
    await queryRunner.query(
      `ALTER TYPE "public"."product_template_type_enum" ADD VALUE 'DELIVERY'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."product_template_type_enum" ADD VALUE 'E-TICKET'`
    );

    // delivery_template 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "delivery_template" (
        "use_options" boolean NOT NULL DEFAULT false,
        "delivery_delivery_fee_type" character varying NOT NULL,
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
        CONSTRAINT "PK_delivery_template" PRIMARY KEY ("id")
      ) INHERITS ("product_template")`
    );

    // eticket_template 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "eticket_template" (
        "use_options" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_eticket_template" PRIMARY KEY ("id")
      ) INHERITS ("product_template")`
    );

    // delivery_template 테이블 외래키 제약조건
    await queryRunner.query(
      `ALTER TABLE "delivery_template" ADD CONSTRAINT "FK_delivery_template_brand" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // eticket_template 테이블 외래키 제약조건
    await queryRunner.query(
      `ALTER TABLE "eticket_template" ADD CONSTRAINT "FK_eticket_template_brand" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // 인덱스 추가
    await queryRunner.query(
      `CREATE INDEX "IDX_delivery_template_brand_id" ON "delivery_template" ("brand_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eticket_template_brand_id" ON "eticket_template" ("brand_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 제거
    await queryRunner.query(`DROP INDEX "IDX_eticket_template_brand_id"`);
    await queryRunner.query(`DROP INDEX "IDX_delivery_template_brand_id"`);

    // 외래키 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "eticket_template" DROP CONSTRAINT "FK_eticket_template_brand"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_template" DROP CONSTRAINT "FK_delivery_template_brand"`
    );

    // 테이블 제거
    await queryRunner.query(`DROP TABLE "eticket_template"`);
    await queryRunner.query(`DROP TABLE "delivery_template"`);

    // Enum 값 제거는 PostgreSQL에서 직접 지원하지 않으므로 
    // enum을 재생성해야 함 (복잡하므로 생략, 필요시 수동 처리)
    // 실제 프로덕션에서는 enum 값을 제거하는 대신 사용하지 않는 것을 권장
  }
}
