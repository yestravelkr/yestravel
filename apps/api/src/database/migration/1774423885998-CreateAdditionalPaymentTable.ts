import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdditionalPaymentTable1774423885998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "additional_payment" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" integer NOT NULL,
        "token" character varying(64) NOT NULL,
        "title" character varying(200) NOT NULL,
        "amount" integer NOT NULL,
        "reason" character varying(500) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "payment_id" integer,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_additional_payment" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_additional_payment_token" UNIQUE ("token"),
        CONSTRAINT "UQ_additional_payment_payment_id" UNIQUE ("payment_id"),
        CONSTRAINT "FK_additional_payment_payment" FOREIGN KEY ("payment_id") REFERENCES "payment"("id"),
        CONSTRAINT "FK_additional_payment_order" FOREIGN KEY ("order_id") REFERENCES "order"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_additional_payment_expires_at" ON "additional_payment" ("expires_at")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_additional_payment_order_id" ON "additional_payment" ("order_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_additional_payment_order_id"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_additional_payment_expires_at"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "additional_payment"`);
  }
}
