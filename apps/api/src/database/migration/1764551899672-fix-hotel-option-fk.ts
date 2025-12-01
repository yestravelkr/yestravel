import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixHotelOptionFk1764551899672 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 FK 삭제 (product 테이블 참조)
    await queryRunner.query(
      `ALTER TABLE "hotel_option" DROP CONSTRAINT IF EXISTS "FK_hotel_option_product"`
    );

    // 새 FK 추가 (hotel_product 테이블 참조)
    await queryRunner.query(
      `ALTER TABLE "hotel_option" ADD CONSTRAINT "FK_hotel_option_hotel_product"
       FOREIGN KEY ("product_id") REFERENCES "hotel_product" ("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 새 FK 삭제
    await queryRunner.query(
      `ALTER TABLE "hotel_option" DROP CONSTRAINT IF EXISTS "FK_hotel_option_hotel_product"`
    );

    // 기존 FK 복원
    await queryRunner.query(
      `ALTER TABLE "hotel_option" ADD CONSTRAINT "FK_hotel_option_product"
       FOREIGN KEY ("product_id") REFERENCES "product" ("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}