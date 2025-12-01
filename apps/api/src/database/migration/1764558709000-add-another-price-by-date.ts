import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnotherPriceByDate1764558709000 implements MigrationInterface {
  name = 'AddAnotherPriceByDate1764558709000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // hotel_option 테이블에 another_price_by_date 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "hotel_option" ADD "another_price_by_date" jsonb NOT NULL DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // another_price_by_date 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE "hotel_option" DROP COLUMN "another_price_by_date"`
    );
  }
}
