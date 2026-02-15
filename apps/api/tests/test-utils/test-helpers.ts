import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { getTestDataSource } from './test-datasource';

export interface TestContext {
  entityManager: EntityManager;
  queryRunner: QueryRunner;
  dataSource: DataSource;
}

/**
 * 테스트 격리를 위한 트랜잭션 래핑 EntityManager 생성
 * 각 테스트는 고유 트랜잭션을 가지며 cleanup 시 rollback됨
 */
export async function getTestingEntityManager(): Promise<TestContext> {
  const dataSource = await getTestDataSource();
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  return {
    entityManager: queryRunner.manager,
    queryRunner,
    dataSource,
  };
}

/**
 * 트랜잭션 rollback 및 query runner 해제
 */
export async function releaseTestContext(ctx: TestContext): Promise<void> {
  if (ctx.queryRunner.isTransactionActive) {
    await ctx.queryRunner.rollbackTransaction();
  }
  await ctx.queryRunner.release();
}

/**
 * 결정론적 ID를 위해 모든 auto-increment 시퀀스를 1로 리셋
 */
export async function resetSequences(em: EntityManager): Promise<void> {
  const sequences = await em.query(`
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  `);

  for (const { sequence_name } of sequences) {
    await em.query(`ALTER SEQUENCE "${sequence_name}" RESTART WITH 1`);
  }
}

/**
 * 모든 테이블 비우기 (beforeAll cleanup용)
 */
export async function truncateAllTables(em: EntityManager): Promise<void> {
  const tables = await em.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != 'migrations'
  `);

  if (tables.length > 0) {
    const tableNames = tables.map((t: any) => `"${t.tablename}"`).join(', ');
    await em.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
  }
}
