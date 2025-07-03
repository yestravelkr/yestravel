import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAdmin1751528653085 implements MigrationInterface {
    name = 'UpdateAdmin1751528653085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."admin_role_enum" AS ENUM('ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF')`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(50) NOT NULL, "password" character varying(20) NOT NULL, "name" character varying(20) NOT NULL, "phone_number" character varying(20) NOT NULL, "role" "public"."admin_role_enum" NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
    }

}
