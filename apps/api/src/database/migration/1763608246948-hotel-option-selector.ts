import { MigrationInterface, QueryRunner } from 'typeorm';

export class hotelOptionSelector1763608246948 implements MigrationInterface {
  name = 'hotelOptionSelector1763608246948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // hotel_option 테이블 생성
    // - HotelOptionEntity 매핑
    // - product_id: 호텔 상품 FK
    // - name: 옵션명 (예: "오션뷰", "조식 포함")
    // - price_by_date: 날짜별 옵션 가격 (JSONB) - Record<string, number>
    //   예: { "2025-01-15": 30000, "2025-01-16": 35000 }
    await queryRunner.query(`CREATE TABLE "hotel_option"
                             (
                                 "id"            SERIAL                 NOT NULL,
                                 "created_at"    TIMESTAMP              NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP              NOT NULL DEFAULT now(),
                                 "deleted_at"    TIMESTAMP,
                                 "product_id"    integer                NOT NULL,
                                 "name"          character varying(255) NOT NULL,
                                 "price_by_date" jsonb                  NOT NULL DEFAULT '{}',
                                 CONSTRAINT "PK_hotel_option" PRIMARY KEY ("id")
                             )`);

    // hotel_option 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX "IDX_hotel_option_product_id" ON "hotel_option" ("product_id")`
    );

    // hotel_sku 테이블 생성 (sku 테이블 상속)
    // - HotelSkuEntity 매핑
    // - sku를 상속받아 sku_code, name, quantity, attributes, product_template_id 포함
    // - check_in_date: 체크인 날짜 (YYYY-MM-DD) - 해당 날짜의 재고 관리
    // - product_template_id + check_in_date: unique 제약조건
    //   같은 템플릿에서 같은 날짜의 SKU는 하나만 존재
    await queryRunner.query(`CREATE TABLE "hotel_sku"
                             (
                                 "check_in_date" date NOT NULL,
                                 CONSTRAINT "PK_hotel_sku" PRIMARY KEY ("id")
                             ) INHERITS ("sku")`);

    // hotel_sku 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX "IDX_hotel_sku_date" ON "hotel_sku" ("check_in_date")`
    );

    // hotel_sku unique 인덱스: 같은 템플릿에서 같은 날짜의 SKU는 유일해야 함
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_hotel_sku_template_date" ON "hotel_sku" ("product_template_id", "check_in_date")`
    );

    // hotel_option FK 제약조건
    await queryRunner.query(
      `ALTER TABLE "hotel_option"
        ADD CONSTRAINT "FK_hotel_option_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // hotel_sku FK 제약조건 (상속받은 테이블도 FK 필요)
    await queryRunner.query(
      `ALTER TABLE "hotel_sku"
        ADD CONSTRAINT "FK_hotel_sku_product_template" FOREIGN KEY ("product_template_id") REFERENCES "product_template" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // FK 제약조건 삭제
    await queryRunner.query(
      `ALTER TABLE "hotel_sku" DROP CONSTRAINT "FK_hotel_sku_product_template"`
    );
    await queryRunner.query(
      `ALTER TABLE "hotel_option" DROP CONSTRAINT "FK_hotel_option_product"`
    );

    // 인덱스 삭제
    await queryRunner.query(
      `DROP INDEX "public"."IDX_hotel_sku_template_date"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_hotel_sku_date"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_hotel_option_product_id"`
    );

    // 테이블 삭제
    await queryRunner.query(`DROP TABLE "hotel_sku"`);
    await queryRunner.query(`DROP TABLE "hotel_option"`);
  }
}
