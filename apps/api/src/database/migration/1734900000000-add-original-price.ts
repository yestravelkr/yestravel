import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 품목(ProductTemplate)과 상품(Product)에 정가(originalPrice) 컬럼 추가
 *
 * - originalPrice: 정가 (원가)
 * - price: 판매가 (할인가) - Product에는 이미 존재, ProductTemplate에 새로 추가
 *
 * PostgreSQL INHERITS 특성상 부모 테이블에만 추가하면 자식 테이블에 자동 상속됨
 */
export class AddOriginalPrice1734900000000 implements MigrationInterface {
  name = 'AddOriginalPrice1734900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ProductTemplate에 original_price, price 추가
    await queryRunner.query(
      `ALTER TABLE "product_template" ADD "original_price" integer NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "product_template" ADD "price" integer NOT NULL DEFAULT 0`
    );

    // Product에 original_price 추가 (price는 이미 존재)
    await queryRunner.query(
      `ALTER TABLE "product" ADD "original_price" integer NOT NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "original_price"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_template" DROP COLUMN "price"`
    );
    await queryRunner.query(
      `ALTER TABLE "product_template" DROP COLUMN "original_price"`
    );
  }
}
