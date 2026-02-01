import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 주문 상태 Enum 확장 마이그레이션
 *
 * - status 컬럼 크기: 20 → 30 (새로운 상태명 길이 대응)
 * - REFUNDED 상태만 변환 (새 체계에서 삭제됨)
 *   - HOTEL: REFUNDED → CANCELLED
 *   - DELIVERY: REFUNDED → RETURNED
 * - 나머지 상태(PENDING, PAID, COMPLETED, CANCELLED)는 그대로 유지
 */
export class UpdateOrderStatusEnum1769930448781 implements MigrationInterface {
  name = 'UpdateOrderStatusEnum1769930448781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. status 컬럼 크기 확장 (20 → 30)
    await queryRunner.query(`
      ALTER TABLE "order" ALTER COLUMN "status" TYPE varchar(30)
    `);

    // 2. REFUNDED 상태만 변환 (새 체계에서 삭제된 상태)
    // type::text로 캐스팅하여 새 enum 값 사용 문제 회피
    // HOTEL: REFUNDED → CANCELLED
    await queryRunner.query(`
      UPDATE "order"
      SET status = 'CANCELLED'
      WHERE status = 'REFUNDED' AND type::text = 'HOTEL'
    `);

    // DELIVERY: REFUNDED → RETURNED
    await queryRunner.query(`
      UPDATE "order"
      SET status = 'RETURNED'
      WHERE status = 'REFUNDED' AND type::text = 'DELIVERY'
    `);

    // E-TICKET: REFUNDED → CANCELLED (사용되지 않지만 안전하게)
    await queryRunner.query(`
      UPDATE "order"
      SET status = 'CANCELLED'
      WHERE status = 'REFUNDED' AND type::text = 'E-TICKET'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 변환된 상태 되돌리기 (REFUNDED 복원은 불가능하므로 유사 상태로)
    // RETURNED → REFUNDED
    await queryRunner.query(`
      UPDATE "order"
      SET status = 'REFUNDED'
      WHERE status = 'RETURNED' AND type::text = 'DELIVERY'
    `);

    // 새로운 상태들을 기존 상태로 변환 (롤백 시)
    // CANCEL_REQUESTED → CANCELLED
    await queryRunner.query(`
      UPDATE "order"
      SET status = 'CANCELLED'
      WHERE status = 'CANCEL_REQUESTED'
    `);

    // 2. status 컬럼 크기 원복 (30 → 20)
    await queryRunner.query(`
      ALTER TABLE "order" ALTER COLUMN "status" TYPE varchar(20)
    `);
  }
}
