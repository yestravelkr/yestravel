import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1751989078653 implements MigrationInterface {
  name = 'migration1751989078653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_media_platform_enum" AS ENUM('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'OTHER')`
    );
    await queryRunner.query(`CREATE TABLE "social_media"
                             (
                               "id"            SERIAL                                NOT NULL,
                               "created_at"    TIMESTAMP                             NOT NULL DEFAULT now(),
                               "updated_at"    TIMESTAMP                             NOT NULL DEFAULT now(),
                               "platform"      "public"."social_media_platform_enum" NOT NULL DEFAULT 'INSTAGRAM',
                               "url"           text                                  NOT NULL,
                               "influencer_id" integer                               NOT NULL,
                               CONSTRAINT "PK_54ac0fd97432069e7c9ab567f8b" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."influencer_business_info_business_type_enum" AS ENUM('CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL')`
    );
    await queryRunner.query(`CREATE TABLE "influencer"
                             (
                               "id"                           SERIAL                 NOT NULL,
                               "created_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "updated_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "name"                         character varying(100) NOT NULL,
                               "email"                        character varying(100),
                               "phone_number"                 character varying(20),
                               "thumbnail"                    character varying(255),
                               "deleted_at"                   TIMESTAMP,
                               "business_info_id"             SERIAL                 NOT NULL,
                               "business_info_created_at"     TIMESTAMP              NOT NULL DEFAULT now(),
                               "business_info_updated_at"     TIMESTAMP              NOT NULL DEFAULT now(),
                               "business_info_business_type"  "public"."influencer_business_info_business_type_enum",
                               "business_info_name"           character varying(50),
                               "business_info_license_number" character varying(30),
                               "business_info_ceo_name"       character varying(20),
                               "bank_info_id"                 SERIAL                 NOT NULL,
                               "bank_info_created_at"         TIMESTAMP              NOT NULL DEFAULT now(),
                               "bank_info_updated_at"         TIMESTAMP              NOT NULL DEFAULT now(),
                               "bank_info_name"               character varying(50),
                               "bank_info_account_number"     character varying(50),
                               "bank_info_account_holder"     character varying(50),
                               CONSTRAINT "PK_73fd8b0db969c62d5c2584b8099" PRIMARY KEY ("id", "business_info_id", "bank_info_id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."influencer_manager_role_enum" AS ENUM('ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF')`
    );
    await queryRunner.query(`CREATE TABLE "influencer_manager"
                             (
                               "id"            SERIAL                                  NOT NULL,
                               "created_at"    TIMESTAMP                               NOT NULL DEFAULT now(),
                               "updated_at"    TIMESTAMP                               NOT NULL DEFAULT now(),
                               "email"         character varying(50)                   NOT NULL,
                               "password"      character varying                       NOT NULL,
                               "name"          character varying(20)                   NOT NULL,
                               "phone_number"  character varying(20)                   NOT NULL,
                               "role"          "public"."influencer_manager_role_enum" NOT NULL,
                               "deleted_at"    TIMESTAMP,
                               "influencer_id" integer,
                               CONSTRAINT "UQ_66b127e63a730a0282348147092" UNIQUE ("email"),
                               CONSTRAINT "PK_602f363dac69d049730abb11cc4" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."admin_role_enum" AS ENUM('ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF')`
    );
    await queryRunner.query(`CREATE TABLE "admin"
                             (
                               "id"           SERIAL                     NOT NULL,
                               "created_at"   TIMESTAMP                  NOT NULL DEFAULT now(),
                               "updated_at"   TIMESTAMP                  NOT NULL DEFAULT now(),
                               "email"        character varying(50)      NOT NULL,
                               "password"     character varying          NOT NULL,
                               "name"         character varying(20)      NOT NULL,
                               "phone_number" character varying(20)      NOT NULL,
                               "role"         "public"."admin_role_enum" NOT NULL,
                               "deleted_at"   TIMESTAMP,
                               CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"),
                               CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."brand_manager_role_enum" AS ENUM('ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF')`
    );
    await queryRunner.query(`CREATE TABLE "brand_manager"
                             (
                               "id"           SERIAL                             NOT NULL,
                               "created_at"   TIMESTAMP                          NOT NULL DEFAULT now(),
                               "updated_at"   TIMESTAMP                          NOT NULL DEFAULT now(),
                               "email"        character varying(50)              NOT NULL,
                               "password"     character varying                  NOT NULL,
                               "name"         character varying(20)              NOT NULL,
                               "phone_number" character varying(20)              NOT NULL,
                               "role"         "public"."brand_manager_role_enum" NOT NULL,
                               "deleted_at"   TIMESTAMP,
                               "brand_id"     integer,
                               CONSTRAINT "UQ_63b097a4079fdeb2ed644a970ea" UNIQUE ("email"),
                               CONSTRAINT "PK_80ad0896f06365aaa6df6c4288a" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."brand_business_info_business_type_enum" AS ENUM('CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL')`
    );
    await queryRunner.query(`CREATE TABLE "brand"
                             (
                               "id"                           SERIAL                 NOT NULL,
                               "created_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "updated_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "name"                         character varying(100) NOT NULL,
                               "email"                        character varying(100),
                               "phone_number"                 character varying(20),
                               "thumbnail"                    character varying(255),
                               "deleted_at"                   TIMESTAMP,
                               "business_info_id"             SERIAL                 NOT NULL,
                               "business_info_created_at"     TIMESTAMP              NOT NULL DEFAULT now(),
                               "business_info_updated_at"     TIMESTAMP              NOT NULL DEFAULT now(),
                               "business_info_business_type"  "public"."brand_business_info_business_type_enum",
                               "business_info_name"           character varying(50),
                               "business_info_license_number" character varying(30),
                               "business_info_ceo_name"       character varying(20),
                               "bank_info_id"                 SERIAL                 NOT NULL,
                               "bank_info_created_at"         TIMESTAMP              NOT NULL DEFAULT now(),
                               "bank_info_updated_at"         TIMESTAMP              NOT NULL DEFAULT now(),
                               "bank_info_name"               character varying(50),
                               "bank_info_account_number"     character varying(50),
                               "bank_info_account_holder"     character varying(50),
                               CONSTRAINT "PK_aa495c07058d38c5016be4d08cf" PRIMARY KEY ("id", "business_info_id", "bank_info_id")
                             )`);
    await queryRunner.query(`ALTER TABLE "social_media"
      ADD CONSTRAINT "FK_ea6dc2616fad0899969c2bb486c" FOREIGN KEY ("influencer_id", "influencer_id", "influencer_id") REFERENCES "influencer" ("id", "business_info_id", "bank_info_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "influencer_manager"
      ADD CONSTRAINT "FK_2bd5e99fcf1e4d59782f83a9ba8" FOREIGN KEY ("influencer_id", "influencer_id", "influencer_id") REFERENCES "influencer" ("id", "business_info_id", "bank_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "brand_manager"
      ADD CONSTRAINT "FK_e10a6d9b9352ee4aa562a137565" FOREIGN KEY ("brand_id", "brand_id", "brand_id") REFERENCES "brand" ("id", "business_info_id", "bank_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brand_manager" DROP CONSTRAINT "FK_e10a6d9b9352ee4aa562a137565"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_manager" DROP CONSTRAINT "FK_2bd5e99fcf1e4d59782f83a9ba8"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_media" DROP CONSTRAINT "FK_ea6dc2616fad0899969c2bb486c"`
    );
    await queryRunner.query(`DROP TABLE "brand"`);
    await queryRunner.query(
      `DROP TYPE "public"."brand_business_info_business_type_enum"`
    );
    await queryRunner.query(`DROP TABLE "brand_manager"`);
    await queryRunner.query(`DROP TYPE "public"."brand_manager_role_enum"`);
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
    await queryRunner.query(`DROP TABLE "influencer_manager"`);
    await queryRunner.query(
      `DROP TYPE "public"."influencer_manager_role_enum"`
    );
    await queryRunner.query(`DROP TABLE "influencer"`);
    await queryRunner.query(
      `DROP TYPE "public"."influencer_business_info_business_type_enum"`
    );
    await queryRunner.query(`DROP TABLE "social_media"`);
    await queryRunner.query(`DROP TYPE "public"."social_media_platform_enum"`);
  }
}
