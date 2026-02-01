import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductCampaignIdNullable1763341675535 implements MigrationInterface {
  name = 'AlterProductCampaignIdNullable1763341675535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // product 테이블의 campaign_id를 nullable로 변경
    // PostgreSQL INHERITS 특성상 부모 테이블만 변경하면 자식 테이블에 자동 적용됨
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "campaign_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // campaign_id를 다시 NOT NULL로 변경 (롤백)
    // PostgreSQL INHERITS 특성상 부모 테이블만 변경하면 자식 테이블에 자동 적용됨
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "campaign_id" SET NOT NULL`
    );
  }
}
