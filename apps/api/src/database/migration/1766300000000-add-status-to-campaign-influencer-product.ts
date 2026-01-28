import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToCampaignInfluencerProduct1766300000000 implements MigrationInterface {
  name = 'AddStatusToCampaignInfluencerProduct1766300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // campaign_influencer_product 테이블에 status 컬럼 추가
    // 기존 campaign_status_enum 재사용 (VISIBLE, HIDDEN, SOLD_OUT)
    await queryRunner.query(`
      ALTER TABLE "campaign_influencer_product"
      ADD COLUMN "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'VISIBLE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // status 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE "campaign_influencer_product"
      DROP COLUMN "status"
    `);
  }
}
