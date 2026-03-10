import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCancellationFees1773138129971 implements MigrationInterface {
  name = 'AddCancellationFees1773138129971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // product 테이블에 cancellation_fees jsonb 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "product" ADD "cancellation_fees" jsonb DEFAULT '[]'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // cancellation_fees 컬럼 삭제
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "cancellation_fees"`
    );
  }
}
