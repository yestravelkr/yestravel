import { MigrationInterface, QueryRunner } from 'typeorm';

export class InfluencerSlugRequired1769430192416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 데이터 중 slug가 NULL인 경우, id 기반으로 임시 slug 할당
    await queryRunner.query(`
      UPDATE influencer
      SET slug = CONCAT('influencer_', id)
      WHERE slug IS NULL
    `);

    // 2. slug 컬럼을 NOT NULL로 변경
    await queryRunner.query(`
      ALTER TABLE influencer
      ALTER COLUMN slug SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // slug 컬럼을 다시 NULL 허용으로 변경
    await queryRunner.query(`
      ALTER TABLE influencer
      ALTER COLUMN slug DROP NOT NULL
    `);
  }
}
