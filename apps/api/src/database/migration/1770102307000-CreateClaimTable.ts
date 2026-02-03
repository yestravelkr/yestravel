import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClaimTable1770102307000 implements MigrationInterface {
  name = 'CreateClaimTable1770102307000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // claim 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "claim" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "type" varchar(20) NOT NULL,
        "product_type" varchar(20) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'REQUESTED',
        "order_id" integer NOT NULL,
        "member_id" integer NOT NULL,
        "previous_order_status" varchar(30) NOT NULL,
        "reason_category" varchar(30) NOT NULL,
        "reason_detail" text,
        "reason_evidence_urls" jsonb,
        "amount_original" integer NOT NULL,
        "amount_refund" integer NOT NULL,
        "detail" jsonb NOT NULL,
        CONSTRAINT "PK_claim" PRIMARY KEY ("id")
      )
    `);

    // 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX "IDX_claim_order_id" ON "claim" ("order_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_claim_member_id" ON "claim" ("member_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_claim_status" ON "claim" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_claim_type" ON "claim" ("type")`
    );

    // Foreign Key 제약조건
    await queryRunner.query(`
      ALTER TABLE "claim"
      ADD CONSTRAINT "FK_claim_order"
      FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "claim"
      ADD CONSTRAINT "FK_claim_member"
      FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Foreign Key 제거
    await queryRunner.query(
      `ALTER TABLE "claim" DROP CONSTRAINT "FK_claim_member"`
    );
    await queryRunner.query(
      `ALTER TABLE "claim" DROP CONSTRAINT "FK_claim_order"`
    );

    // 인덱스 제거
    await queryRunner.query(`DROP INDEX "public"."IDX_claim_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_claim_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_claim_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_claim_order_id"`);

    // 테이블 제거
    await queryRunner.query(`DROP TABLE "claim"`);
  }
}
