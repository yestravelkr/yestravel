import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToInfluencer1766400000000 implements MigrationInterface {
  name = 'AddSlugToInfluencer1766400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // influencer 테이블에 slug 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE "influencer"
      ADD COLUMN "slug" varchar(50) NULL
    `);

    // slug에 unique 인덱스 추가
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_influencer_slug" ON "influencer" ("slug")
      WHERE "slug" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 제거
    await queryRunner.query(`
      DROP INDEX "IDX_influencer_slug"
    `);

    // slug 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE "influencer"
      DROP COLUMN "slug"
    `);
  }
}
