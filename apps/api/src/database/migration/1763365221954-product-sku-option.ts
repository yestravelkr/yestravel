import {MigrationInterface, QueryRunner} from "typeorm";

export class productSkuOption1763365221954 implements MigrationInterface {
  name = 'productSkuOption1763365221954'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // product_option 테이블 생성
    // - ProductOptionEntity 매핑
    // - product_id: 상품 FK
    // - name: 옵션명 (예: "사이즈 선택", "아이스크림 3개 골라담기")
    // - price: 옵션 추가 가격
    // - is_active: 활성화 여부
    // - sku_selectors: SKU 선택 설정 (JSONB) - SkuSelectorConfig[]
    //   사용자가 어떤 SKU를 선택할 수 있는지 정의
    await queryRunner.query(`CREATE TABLE "product_option"
                             (
                                 "id"            SERIAL                 NOT NULL,
                                 "created_at"    TIMESTAMP              NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP              NOT NULL DEFAULT now(),
                                 "deleted_at"    TIMESTAMP,
                                 "product_id"    integer                NOT NULL,
                                 "name"          character varying(255) NOT NULL,
                                 "price"         integer                NOT NULL DEFAULT '0',
                                 "is_active"     boolean                NOT NULL DEFAULT true,
                                 "sku_selectors" jsonb                  NOT NULL DEFAULT '[]',
                                 CONSTRAINT "PK_product_option" PRIMARY KEY ("id")
                             )`);

    // product_option 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_product_option_product_id" ON "product_option" ("product_id") `);

    // sku 테이블 생성
    // - SkuEntity 매핑
    // - sku_code: SKU 코드 (product_template_id와 함께 unique)
    // - name: SKU 이름
    // - quantity: 재고 수량
    // - attributes: SKU 속성 (JSONB) - { color: "red", size: "XL" } 형태
    // - product_template_id: 품목 템플릿 FK (같은 템플릿으로 만든 상품끼리 재고 공유)
    await queryRunner.query(`CREATE TABLE "sku"
                             (
                                 "id"                  SERIAL            NOT NULL,
                                 "created_at"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "sku_code"            character varying NOT NULL,
                                 "name"                character varying NOT NULL,
                                 "quantity"            integer           NOT NULL DEFAULT '0',
                                 "attributes"          jsonb             NOT NULL DEFAULT '{}',
                                 "product_template_id" integer           NOT NULL,
                                 CONSTRAINT "PK_sku" PRIMARY KEY ("id")
                             )`);

    // sku 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_sku_product_template_id" ON "sku" ("product_template_id") `);

    // sku unique 인덱스: 같은 템플릿 내에서 SKU 코드는 유일해야 함
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sku_product_template_sku_code" ON "sku" ("product_template_id", "sku_code") `);

    // product_option FK 제약조건
    await queryRunner.query(`ALTER TABLE "product_option"
        ADD CONSTRAINT "FK_product_option_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    // sku FK 제약조건
    await queryRunner.query(`ALTER TABLE "sku"
        ADD CONSTRAINT "FK_sku_product_template" FOREIGN KEY ("product_template_id") REFERENCES "product_template" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // FK 제약조건 삭제
    await queryRunner.query(`ALTER TABLE "sku" DROP CONSTRAINT "FK_sku_product_template"`);
    await queryRunner.query(`ALTER TABLE "product_option" DROP CONSTRAINT "FK_product_option_product"`);

    // 인덱스 삭제
    await queryRunner.query(`DROP INDEX "public"."UQ_sku_product_template_sku_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sku_product_template_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_option_product_id"`);

    // 테이블 삭제
    await queryRunner.query(`DROP TABLE "sku"`);
    await queryRunner.query(`DROP TABLE "product_option"`);
  }

}
