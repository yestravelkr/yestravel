import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHappyCallConfig1774200000000 implements MigrationInterface {
  name = 'AddHappyCallConfig1774200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "happy_call_config" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "happy_call_config"`
    );
  }
}
