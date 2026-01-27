import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberIdToOrder1769500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. order 테이블에 member_id 컬럼 추가 (NOT NULL)
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN "member_id" integer NOT NULL
    `);

    // 2. member 테이블과 외래키 관계 설정
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD CONSTRAINT "FK_order_member_id"
      FOREIGN KEY ("member_id")
      REFERENCES "member" ("id")
      ON DELETE CASCADE
    `);

    // 3. 인덱스 추가
    await queryRunner.query(`
      CREATE INDEX "IDX_order_member_id"
      ON "order" ("member_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 인덱스 삭제
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_order_member_id"
    `);

    // 2. 외래키 삭제
    await queryRunner.query(`
      ALTER TABLE "order"
      DROP CONSTRAINT IF EXISTS "FK_order_member_id"
    `);

    // 3. 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "order"
      DROP COLUMN IF EXISTS "member_id"
    `);
  }
}
