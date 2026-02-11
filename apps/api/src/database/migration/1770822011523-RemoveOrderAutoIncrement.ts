import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrderAutoIncrement1770822011523 implements MigrationInterface {
  name = 'RemoveOrderAutoIncrement1770822011523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 현재 최대 ID 조회
    const maxTmpOrderResult = await queryRunner.query(
      `SELECT COALESCE(MAX(id), 0) as max FROM tmp_order`
    );
    const maxOrderResult = await queryRunner.query(
      `SELECT COALESCE(MAX(id), 0) as max FROM "order"`
    );

    const maxId = Math.max(maxTmpOrderResult[0].max, maxOrderResult[0].max);

    // 2. tmp_order 시퀀스를 안전한 값으로 설정 (buffer 1000)
    const safeValue = maxId + 1000;
    await queryRunner.query(
      `SELECT setval('tmp_order_id_seq', ${safeValue}, false)`
    );

    // 3. order 테이블의 auto-increment 제거
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN id DROP DEFAULT`);

    // 4. order_id_seq 시퀀스 제거 (더 이상 사용 안 함)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS order_id_seq`);

    // 5. 변경 사항 기록
    await queryRunner.query(
      `COMMENT ON COLUMN "order".id IS 'Manually set from tmp_order.id (no auto-increment)'`
    );

    console.log(`✅ Migration completed`);
    console.log(`   - tmp_order_id_seq: ${safeValue}`);
    console.log(`   - order.id: manual management enabled`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 현재 order 최대 ID 조회
    const result = await queryRunner.query(
      `SELECT COALESCE(MAX(id), 0) as max FROM "order"`
    );
    const maxOrderId = result[0].max;

    // 2. order_id_seq 재생성
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS order_id_seq START WITH ${maxOrderId + 1}`
    );

    // 3. auto-increment 복원
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN id SET DEFAULT nextval('order_id_seq')`
    );

    // 4. 시퀀스 소유권 설정
    await queryRunner.query(`ALTER SEQUENCE order_id_seq OWNED BY "order".id`);

    // 5. 코멘트 제거
    await queryRunner.query(`COMMENT ON COLUMN "order".id IS NULL`);

    console.log('✅ Rollback completed. Order auto-increment restored.');
  }
}
