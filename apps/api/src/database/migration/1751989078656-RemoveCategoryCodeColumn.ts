import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCategoryCodeColumn1751989078656
  implements MigrationInterface
{
  name = 'RemoveCategoryCodeColumn1751989078656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // code 컬럼 삭제
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "code"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 시 code 컬럼 복원
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "code" varchar(100) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_categories_code" UNIQUE ("code")`
    );
  }
}
