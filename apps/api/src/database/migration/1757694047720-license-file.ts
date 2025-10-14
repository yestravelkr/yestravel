import { MigrationInterface, QueryRunner } from 'typeorm';

export class licenseFile1757694047720 implements MigrationInterface {
  name = 'licenseFile1757694047720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_license_file_url" character varying(1024)`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_license_file_url" character varying(1024)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_license_file_url"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_license_file_url"`
    );
  }
}
