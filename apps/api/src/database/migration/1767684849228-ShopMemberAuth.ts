import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopMemberAuth1767684849228 implements MigrationInterface {
  name = 'ShopMemberAuth1767684849228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. member 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "member"
      (
        "id"             SERIAL PRIMARY KEY,
        "created_at"     TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP   NOT NULL DEFAULT now(),
        "deleted_at"     TIMESTAMP,
        "phone"          VARCHAR(20) NOT NULL UNIQUE,
        "name"           VARCHAR(100),
        "address"        VARCHAR(500),
        "address_detail" VARCHAR(200),
        "postal_code"    VARCHAR(10)
      )
    `);

    // member 인덱스
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_member_phone" ON "member" ("phone")
    `);

    // 2. phone_verification 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "phone_verification"
      (
        "id"          SERIAL PRIMARY KEY,
        "phone"       VARCHAR(20)  NOT NULL,
        "code"        VARCHAR(6)   NOT NULL,
        "expires_at"  TIMESTAMP    NOT NULL,
        "verified_at" TIMESTAMP,
        "created_at"  TIMESTAMP    NOT NULL DEFAULT now()
      )
    `);

    // phone_verification 인덱스
    await queryRunner.query(`
      CREATE INDEX "IDX_phone_verification_phone" ON "phone_verification" ("phone")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_phone_verification_expires_at" ON "phone_verification" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // phone_verification 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_phone_verification_expires_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_phone_verification_phone"`);

    // phone_verification 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "phone_verification"`);

    // member 인덱스 삭제
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_member_phone"`);

    // member 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "member"`);
  }
}
