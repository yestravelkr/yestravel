import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAdmin1751528653085 implements MigrationInterface {
    name = 'UpdateAdmin1751528653085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // admin_role_enum 타입 생성
        await queryRunner.query(`CREATE TYPE "public"."admin_role_enum" AS ENUM('ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF')`);
        
        // 기존 admin 테이블에 새로운 컬럼들 추가
        await queryRunner.query(`ALTER TABLE "admin" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "name" character varying(20) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "phone_number" character varying(20) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "role" "public"."admin_role_enum" NOT NULL DEFAULT 'ADMIN_STAFF'`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "deleted_at" TIMESTAMP`);
        
        // 기존 컬럼 타입 변경
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "email" TYPE character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 추가된 컬럼들 제거
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "created_at"`);
        
        // 컬럼 타입 원래대로 복구
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "email" TYPE character varying`);
        
        // enum 타입 제거
        await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
    }

}
