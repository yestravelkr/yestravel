import { MigrationInterface, QueryRunner } from 'typeorm';

export class campaign1753798073121 implements MigrationInterface {
  name = 'campaign1753798073121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_media" DROP CONSTRAINT "FK_ea6dc2616fad0899969c2bb486c"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_manager" DROP CONSTRAINT "FK_2bd5e99fcf1e4d59782f83a9ba8"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand_manager" DROP CONSTRAINT "FK_e10a6d9b9352ee4aa562a137565"`
    );

    // Campaign 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "campaign" (
        "id" SERIAL NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "title" character varying NOT NULL, 
        "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
        "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
        "description" text, 
        "thumbnail" character varying, 
        CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id")
      )`
    );

    // Product 타입 열거형 생성 (HOTEL만 포함)
    await queryRunner.query(
      `CREATE TYPE "public"."product_type_enum" AS ENUM('HOTEL')`
    );

    // Product 테이블 생성 (상속 부모 테이블)
    await queryRunner.query(
      `CREATE TABLE "product" (
        "id" SERIAL NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "name" character varying NOT NULL, 
        "price" integer NOT NULL, 
        "type" "public"."product_type_enum" NOT NULL, 
        "campaign_id" integer NOT NULL, 
        CONSTRAINT "REL_product_campaign_id" UNIQUE ("campaign_id"), 
        CONSTRAINT "PK_product_id" PRIMARY KEY ("id")
      )`
    );

    // hotel_product 테이블을 product 테이블을 상속받도록 생성
    await queryRunner.query(
      `CREATE TABLE "hotel_product" (
        "hotel_name" character varying NOT NULL, 
        "address" character varying NOT NULL,
        CONSTRAINT "PK_hotel_product_id" PRIMARY KEY ("id")
      ) INHERITS ("product")`
    );

    // 나머지 기존 마이그레이션 코드
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP CONSTRAINT "PK_73fd8b0db969c62d5c2584b8099"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD CONSTRAINT "PK_59b6be0724442ef98b2b4d3cf20" PRIMARY KEY ("id", "bank_info_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "business_info_updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP CONSTRAINT "PK_59b6be0724442ef98b2b4d3cf20"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD CONSTRAINT "PK_932fc0c1fbb494513647d1854be" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "bank_info_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "bank_info_created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP COLUMN "bank_info_updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT "PK_aa495c07058d38c5016be4d08cf"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "PK_3e0e519b40bba49911068121366" PRIMARY KEY ("id", "bank_info_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "business_info_updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT "PK_3e0e519b40bba49911068121366"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id")`
    );
    await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "bank_info_id"`);
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "bank_info_created_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP COLUMN "bank_info_updated_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "name" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "phone_number" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "social_media" ADD CONSTRAINT "FK_223ed16bafcd276ca87d2b7b5c9" FOREIGN KEY ("influencer_id") REFERENCES "influencer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_manager" ADD CONSTRAINT "FK_6a98a1c6d55d677a1faeff73101" FOREIGN KEY ("influencer_id") REFERENCES "influencer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "brand_manager" ADD CONSTRAINT "FK_f00b2fe7934a8ee393c279430fd" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    // product 테이블에 campaign 외래키 제약조건 추가
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    // hotel_product 테이블에도 외래키 제약조건 추가 (PostgreSQL 상속 특성상 필요)
    await queryRunner.query(
      `ALTER TABLE "hotel_product" ADD CONSTRAINT "FK_hotel_product_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래키 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "hotel_product" DROP CONSTRAINT "FK_hotel_product_campaign_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_campaign_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand_manager" DROP CONSTRAINT "FK_f00b2fe7934a8ee393c279430fd"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_manager" DROP CONSTRAINT "FK_6a98a1c6d55d677a1faeff73101"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_media" DROP CONSTRAINT "FK_223ed16bafcd276ca87d2b7b5c9"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "role" SET DEFAULT 'ADMIN_STAFF'`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "phone_number" SET DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ALTER COLUMN "name" SET DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "bank_info_updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "bank_info_created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "bank_info_id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "PK_3e0e519b40bba49911068121366" PRIMARY KEY ("id", "bank_info_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD "business_info_id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" DROP CONSTRAINT "PK_3e0e519b40bba49911068121366"`
    );
    await queryRunner.query(
      `ALTER TABLE "brand" ADD CONSTRAINT "PK_aa495c07058d38c5016be4d08cf" PRIMARY KEY ("id", "business_info_id", "bank_info_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "bank_info_updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "bank_info_created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "bank_info_id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP CONSTRAINT "PK_932fc0c1fbb494513647d1854be"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD CONSTRAINT "PK_59b6be0724442ef98b2b4d3cf20" PRIMARY KEY ("id", "bank_info_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD "business_info_id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" DROP CONSTRAINT "PK_59b6be0724442ef98b2b4d3cf20"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer" ADD CONSTRAINT "PK_73fd8b0db969c62d5c2584b8099" PRIMARY KEY ("id", "business_info_id", "bank_info_id")`
    );

    // 테이블들 제거
    await queryRunner.query(`DROP TABLE "hotel_product"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TYPE "public"."product_type_enum"`);
    await queryRunner.query(`DROP TABLE "campaign"`);

    await queryRunner.query(
      `ALTER TABLE "brand_manager" ADD CONSTRAINT "FK_e10a6d9b9352ee4aa562a137565" FOREIGN KEY ("brand_id", "brand_id", "brand_id") REFERENCES "brand"("id","business_info_id","bank_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_manager" ADD CONSTRAINT "FK_2bd5e99fcf1e4d59782f83a9ba8" FOREIGN KEY ("influencer_id", "influencer_id", "influencer_id") REFERENCES "influencer"("id","business_info_id","bank_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "social_media" ADD CONSTRAINT "FK_ea6dc2616fad0899969c2bb486c" FOREIGN KEY ("influencer_id", "influencer_id", "influencer_id") REFERENCES "influencer"("id","business_info_id","bank_info_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
