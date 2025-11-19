import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyHotelProductColumns1731825300000
  implements MigrationInterface
{
  name = 'RemoveLegacyHotelProductColumns1731825300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // hotel_product 테이블의 레거시 컬럼 제거
    // 이 컬럼들은 초기 campaign 마이그레이션에서 생성되었지만
    // 현재 Entity 구조에서는 사용되지 않음
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN IF EXISTS "hotel_name"`
    );

    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP COLUMN IF EXISTS "address"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 불가 - 레거시 컬럼 복원 불필요
  }
}