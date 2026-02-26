import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderHistoryTable1771911204021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_history" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_id" integer NOT NULL REFERENCES "order"("id"),
        "previous_status" varchar(30),
        "new_status" varchar(30) NOT NULL,
        "actor_type" varchar(10) NOT NULL,
        "actor_id" integer REFERENCES "admin"("id"),
        "actor_name" varchar(50),
        "action" varchar(30) NOT NULL,
        "description" text,
        "claim_id" integer REFERENCES "claim"("id"),
        "option_id" integer,
        "option_name" varchar(100),
        "metadata" jsonb
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_history_order_id" ON "order_history" ("order_id")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_history_action" ON "order_history" ("action")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_history_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_history_order_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_history"`);
  }
}
