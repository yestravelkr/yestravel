import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePhoneVerificationTable1767300000001 implements MigrationInterface {
  name = 'CreatePhoneVerificationTable1767300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "phone_verification" (
        "id" SERIAL NOT NULL,
        "phone_number" varchar(20) NOT NULL,
        "verification_code" varchar(6) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_verified" boolean NOT NULL DEFAULT false,
        "attempt_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_phone_verification" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_phone_verification_phone_number" ON "phone_verification" ("phone_number")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_phone_verification_expires_at" ON "phone_verification" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_phone_verification_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_phone_verification_phone_number"`);
    await queryRunner.query(`DROP TABLE "phone_verification"`);
  }
}
