import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductCampaignIdNullable1731825200000
  implements MigrationInterface
{
  name = 'AlterProductCampaignIdNullable1731825200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. product 테이블의 campaign_id를 nullable로 변경
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "campaign_id" DROP NOT NULL`
    );

    // 2. hotel_product 테이블의 campaign_id를 nullable로 변경
    // PostgreSQL INHERITS 특성상 자식 테이블도 독립적으로 제약조건을 가질 수 있음
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ALTER COLUMN "campaign_id" DROP NOT NULL`
    );

    // 3. delivery_product 테이블의 campaign_id를 nullable로 변경
    await queryRunner.query(
      `ALTER TABLE "delivery_product" ALTER COLUMN "campaign_id" DROP NOT NULL`
    );

    // 4. eticket_product 테이블의 campaign_id를 nullable로 변경
    await queryRunner.query(
      `ALTER TABLE "eticket_product" ALTER COLUMN "campaign_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // campaign_id를 다시 NOT NULL로 변경 (롤백)
    await queryRunner.query(
      `ALTER TABLE "eticket_product" ALTER COLUMN "campaign_id" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "delivery_product" ALTER COLUMN "campaign_id" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "hotel_product" ALTER COLUMN "campaign_id" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "campaign_id" SET NOT NULL`
    );
  }
}