import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocialAccount1768373231079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. social_provider_enum 타입 생성
    await queryRunner.query(`
      CREATE TYPE "social_provider_enum" AS ENUM ('KAKAO', 'NAVER', 'GOOGLE', 'APPLE')
    `);

    // 2. social_account 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "social_account"
      (
        "id"          SERIAL PRIMARY KEY,
        "created_at"  TIMESTAMP           NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP           NOT NULL DEFAULT now(),
        "member_id"   INT                 NOT NULL REFERENCES "member" ("id"),
        "provider"    social_provider_enum NOT NULL,
        "provider_id" VARCHAR(100)        NOT NULL,
        "email"       VARCHAR(255),
        UNIQUE ("provider", "provider_id")
      )
    `);

    // 3. 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX "IDX_social_account_member_id" ON "social_account" ("member_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_social_account_member_id"`
    );

    // 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "social_account"`);

    // enum 타입 삭제
    await queryRunner.query(`DROP TYPE IF EXISTS "social_provider_enum"`);
  }
}
