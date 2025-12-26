import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBusinessInfoFields1735200000000 implements MigrationInterface {
  name = 'AddBusinessInfoFields1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // brand 테이블에 address, mail_order_license_number 추가
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_address" character varying(500)`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_mail_order_license_number" character varying(100)`
    );

    // influencer 테이블에 address, mail_order_license_number 추가
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_address" character varying(500)`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_mail_order_license_number" character varying(100)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_mail_order_license_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_address"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_mail_order_license_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_address"`
    );
  }
}
