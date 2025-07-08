import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInfluencerAndBrand1751530863036
  implements MigrationInterface
{
  name = 'CreateInfluencerAndBrand1751530863036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_media_platform_enum" AS ENUM('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'OTHER')`
    );
    await queryRunner.query(`CREATE TABLE "social_media"
                             (
                               "id"              SERIAL                                NOT NULL,
                               "created_at"      TIMESTAMP                             NOT NULL DEFAULT now(),
                               "updated_at"      TIMESTAMP                             NOT NULL DEFAULT now(),
                               "platform"        "public"."social_media_platform_enum" NOT NULL DEFAULT 'INSTAGRAM',
                               "url"             text                                  NOT NULL,
                               "followers_count" integer,
                               "is_verified"     boolean                               NOT NULL DEFAULT false,
                               "influencer_id"   integer                               NOT NULL,
                               CONSTRAINT "PK_54ac0fd97432069e7c9ab567f8b" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."influencer_business_type_enum" AS ENUM('CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL')`
    );
    await queryRunner.query(`CREATE TABLE "influencer"
                             (
                               "id"                           SERIAL                 NOT NULL,
                               "created_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "updated_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "name"                         character varying(100) NOT NULL,
                               "email"                        character varying(100),
                               "phone_number"                 character varying(20),
                               "business_type"                "public"."influencer_business_type_enum",
                               "business_registration_number" character varying(20),
                               "representative_name"          character varying(50),
                               "bank_name"                    character varying(50),
                               "account_number"               character varying(50),
                               "account_holder"               character varying(50),
                               "deleted_at"                   TIMESTAMP,
                               CONSTRAINT "PK_932fc0c1fbb494513647d1854be" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."brand_business_type_enum" AS ENUM('CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL')`
    );
    await queryRunner.query(`CREATE TABLE "brand"
                             (
                               "id"                           SERIAL                 NOT NULL,
                               "created_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "updated_at"                   TIMESTAMP              NOT NULL DEFAULT now(),
                               "name"                         character varying(100) NOT NULL,
                               "email"                        character varying(100),
                               "phone_number"                 character varying(20),
                               "description"                  text,
                               "website_url"                  character varying(255),
                               "business_type"                "public"."brand_business_type_enum",
                               "business_registration_number" character varying(20),
                               "representative_name"          character varying(50),
                               "bank_name"                    character varying(50),
                               "account_number"               character varying(50),
                               "account_holder"               character varying(50),
                               "deleted_at"                   TIMESTAMP,
                               CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "social_media"
      ADD CONSTRAINT "FK_223ed16bafcd276ca87d2b7b5c9" FOREIGN KEY ("influencer_id") REFERENCES "influencer" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_media" DROP CONSTRAINT "FK_223ed16bafcd276ca87d2b7b5c9"`
    );
    await queryRunner.query(`DROP TABLE "brand"`);
    await queryRunner.query(`DROP TYPE "public"."brand_business_type_enum"`);
    await queryRunner.query(`DROP TABLE "influencer"`);
    await queryRunner.query(
      `DROP TYPE "public"."influencer_business_type_enum"`
    );
    await queryRunner.query(`DROP TABLE "social_media"`);
    await queryRunner.query(`DROP TYPE "public"."social_media_platform_enum"`);
  }
}
