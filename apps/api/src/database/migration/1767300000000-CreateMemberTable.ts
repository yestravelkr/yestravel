import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMemberTable1767300000000 implements MigrationInterface {
  name = 'CreateMemberTable1767300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "member" (
        "id" SERIAL NOT NULL,
        "phone_number" varchar(20) NOT NULL,
        "name" varchar(50),
        "email" varchar(100),
        "address" jsonb,
        "is_guest" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_member_phone_number" UNIQUE ("phone_number"),
        CONSTRAINT "PK_member" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_member_phone_number" ON "member" ("phone_number")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_member_is_guest" ON "member" ("is_guest")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_member_is_guest"`);
    await queryRunner.query(`DROP INDEX "IDX_member_phone_number"`);
    await queryRunner.query(`DROP TABLE "member"`);
  }
}
