import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberIdToTmpOrder1769947301856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 tmp_order 데이터 삭제 (결제 전 임시 데이터이므로 삭제 가능)
    await queryRunner.query(`DELETE FROM tmp_order`);

    // memberId 컬럼 추가 (NOT NULL)
    await queryRunner.query(
      `ALTER TABLE tmp_order ADD COLUMN "memberId" integer NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tmp_order DROP COLUMN "memberId"`);
  }
}
