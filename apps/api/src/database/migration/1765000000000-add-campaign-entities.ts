import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCampaignEntities1765000000000 implements MigrationInterface {
  name = 'AddCampaignEntities1765000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum 타입 생성
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_period_type_enum" AS ENUM('DEFAULT', 'CUSTOM')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_fee_type_enum" AS ENUM('NONE', 'CUSTOM')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_status_enum" AS ENUM('VISIBLE', 'HIDDEN', 'SOLD_OUT')`
    );

    // 2. campaign_product 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "campaign_product" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "campaign_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'VISIBLE',
        CONSTRAINT "UQ_campaign_product" UNIQUE ("campaign_id", "product_id"),
        CONSTRAINT "PK_campaign_product" PRIMARY KEY ("id")
      )
    `);

    // 3. campaign_influencer 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "campaign_influencer" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "campaign_id" integer NOT NULL,
        "influencer_id" integer NOT NULL,
        "period_type" "public"."campaign_period_type_enum" NOT NULL DEFAULT 'DEFAULT',
        "start_at" TIMESTAMP WITH TIME ZONE,
        "end_at" TIMESTAMP WITH TIME ZONE,
        "fee_type" "public"."campaign_fee_type_enum" NOT NULL DEFAULT 'NONE',
        "fee" integer,
        "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'VISIBLE',
        CONSTRAINT "UQ_campaign_influencer" UNIQUE ("campaign_id", "influencer_id"),
        CONSTRAINT "PK_campaign_influencer" PRIMARY KEY ("id")
      )
    `);

    // 4. campaign_influencer_product 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "campaign_influencer_product" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "campaign_influencer_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "use_custom_commission" boolean NOT NULL DEFAULT false,
        CONSTRAINT "UQ_campaign_influencer_product" UNIQUE ("campaign_influencer_id", "product_id"),
        CONSTRAINT "PK_campaign_influencer_product" PRIMARY KEY ("id")
      )
    `);

    // 5. campaign_hotel_option 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "campaign_hotel_option" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "campaign_influencer_product_id" integer NOT NULL,
        "hotel_option_id" integer NOT NULL,
        "influencer_id" integer NOT NULL,
        "commission_by_date" jsonb NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_campaign_hotel_option" PRIMARY KEY ("id")
      )
    `);

    // 6. 인덱스 생성
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_product_campaign_id" ON "campaign_product" ("campaign_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_product_product_id" ON "campaign_product" ("product_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_influencer_campaign_id" ON "campaign_influencer" ("campaign_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_influencer_influencer_id" ON "campaign_influencer" ("influencer_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_influencer_product_campaign_influencer_id" ON "campaign_influencer_product" ("campaign_influencer_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_influencer_product_product_id" ON "campaign_influencer_product" ("product_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_hotel_option_campaign_influencer_product_id" ON "campaign_hotel_option" ("campaign_influencer_product_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_hotel_option_hotel_option_id" ON "campaign_hotel_option" ("hotel_option_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_campaign_hotel_option_influencer_id" ON "campaign_hotel_option" ("influencer_id")`
    );

    // 7. Foreign Key 제약조건 추가
    // campaign_product
    // NOTE: campaign FK만 추가, product FK는 제거
    // PostgreSQL INHERITS 특성상 자식 테이블(hotel_product 등)의 데이터를
    // 부모 테이블(product)의 FK로 참조할 수 없음
    // product 존재 여부는 애플리케이션 레벨(validateExistsByIds)에서 검증
    await queryRunner.query(`
      ALTER TABLE "campaign_product"
      ADD CONSTRAINT "FK_campaign_product_campaign"
      FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // campaign_influencer
    await queryRunner.query(`
      ALTER TABLE "campaign_influencer"
      ADD CONSTRAINT "FK_campaign_influencer_campaign"
      FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "campaign_influencer"
      ADD CONSTRAINT "FK_campaign_influencer_influencer"
      FOREIGN KEY ("influencer_id") REFERENCES "influencer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // campaign_influencer_product
    // NOTE: campaign_influencer FK만 추가, product FK는 제거 (INHERITS 문제)
    await queryRunner.query(`
      ALTER TABLE "campaign_influencer_product"
      ADD CONSTRAINT "FK_campaign_influencer_product_campaign_influencer"
      FOREIGN KEY ("campaign_influencer_id") REFERENCES "campaign_influencer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // campaign_hotel_option
    await queryRunner.query(`
      ALTER TABLE "campaign_hotel_option"
      ADD CONSTRAINT "FK_campaign_hotel_option_campaign_influencer_product"
      FOREIGN KEY ("campaign_influencer_product_id") REFERENCES "campaign_influencer_product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "campaign_hotel_option"
      ADD CONSTRAINT "FK_campaign_hotel_option_hotel_option"
      FOREIGN KEY ("hotel_option_id") REFERENCES "hotel_option"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "campaign_hotel_option"
      ADD CONSTRAINT "FK_campaign_hotel_option_influencer"
      FOREIGN KEY ("influencer_id") REFERENCES "influencer"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 8. Product 테이블에서 campaign_id 컬럼 제거
    // 먼저 Foreign Key 제약조건 제거 (존재하는 경우)
    await queryRunner.query(`
      ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "FK_product_campaign"
    `);
    // 자식 테이블들의 Foreign Key도 제거 (PostgreSQL INHERITS 특성상 필요)
    await queryRunner.query(`
      ALTER TABLE "hotel_product" DROP CONSTRAINT IF EXISTS "FK_hotel_product_campaign"
    `);
    await queryRunner.query(`
      ALTER TABLE "delivery_product" DROP CONSTRAINT IF EXISTS "FK_delivery_product_campaign"
    `);
    await queryRunner.query(`
      ALTER TABLE "eticket_product" DROP CONSTRAINT IF EXISTS "FK_eticket_product_campaign"
    `);
    // campaign_id 컬럼 제거 (부모 테이블에서만 제거하면 자식들도 자동 반영)
    await queryRunner.query(`
      ALTER TABLE "product" DROP COLUMN IF EXISTS "campaign_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Product 테이블에 campaign_id 컬럼 복원
    await queryRunner.query(`
      ALTER TABLE "product" ADD COLUMN "campaign_id" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD CONSTRAINT "FK_product_campaign"
      FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 2. Foreign Key 제약조건 제거
    await queryRunner.query(
      `ALTER TABLE "campaign_hotel_option" DROP CONSTRAINT "FK_campaign_hotel_option_influencer"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_hotel_option" DROP CONSTRAINT "FK_campaign_hotel_option_hotel_option"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_hotel_option" DROP CONSTRAINT "FK_campaign_hotel_option_campaign_influencer_product"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_influencer_product" DROP CONSTRAINT "FK_campaign_influencer_product_campaign_influencer"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_influencer" DROP CONSTRAINT "FK_campaign_influencer_influencer"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_influencer" DROP CONSTRAINT "FK_campaign_influencer_campaign"`
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_product" DROP CONSTRAINT "FK_campaign_product_campaign"`
    );

    // 3. 인덱스 제거
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_hotel_option_influencer_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_hotel_option_hotel_option_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_hotel_option_campaign_influencer_product_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_influencer_product_product_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_influencer_product_campaign_influencer_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_influencer_influencer_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_influencer_campaign_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_product_product_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_product_campaign_id"`
    );

    // 4. 테이블 제거
    await queryRunner.query(`DROP TABLE "campaign_hotel_option"`);
    await queryRunner.query(`DROP TABLE "campaign_influencer_product"`);
    await queryRunner.query(`DROP TABLE "campaign_influencer"`);
    await queryRunner.query(`DROP TABLE "campaign_product"`);

    // 5. Enum 타입 제거
    await queryRunner.query(`DROP TYPE "public"."campaign_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."campaign_fee_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."campaign_period_type_enum"`);
  }
}
