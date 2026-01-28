import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUseStockToProductTemplate1760425824471 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_template"
      ADD COLUMN "use_stock" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_template"
      DROP COLUMN "use_stock"
    `);
  }
}
