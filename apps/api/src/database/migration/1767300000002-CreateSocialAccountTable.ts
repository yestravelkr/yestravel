import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocialAccountTable1767300000002 implements MigrationInterface {
  name = 'CreateSocialAccountTable1767300000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "social_provider_enum" AS ENUM('KAKAO', 'NAVER', 'GOOGLE')
    `);

    await queryRunner.query(`
      CREATE TABLE "social_account" (
        "id" SERIAL NOT NULL,
        "member_id" integer NOT NULL,
        "provider" "social_provider_enum" NOT NULL,
        "provider_id" varchar(255) NOT NULL,
        "provider_email" varchar(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_social_account" PRIMARY KEY ("id"),
        CONSTRAINT "FK_social_account_member" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_social_account_provider" UNIQUE ("provider", "provider_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_account_member_id" ON "social_account" ("member_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_account_provider" ON "social_account" ("provider", "provider_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_social_account_provider"`);
    await queryRunner.query(`DROP INDEX "IDX_social_account_member_id"`);
    await queryRunner.query(`DROP TABLE "social_account"`);
    await queryRunner.query(`DROP TYPE "social_provider_enum"`);
  }
}
