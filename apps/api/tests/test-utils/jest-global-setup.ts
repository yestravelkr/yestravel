import { execSync } from 'child_process';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { register } from 'tsconfig-paths';
import path from 'path';

// tsconfig paths 등록 (globalSetup에서 @src alias 사용 가능하도록)
register({
  baseUrl: path.resolve(__dirname, '../../'),
  paths: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@src/*': ['./src/*'],
  },
});

const DOCKER_COMPOSE_FILE = 'docker/docker-compose.test.yml';
const CONTAINER_NAME = 'yestravel-test-postgresql';
const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 1000;

async function waitForPostgres(): Promise<void> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const ds = new DataSource({
        type: 'postgres',
        host: '127.0.0.1',
        port: 55432,
        username: 'postgres',
        password: 'postgres',
        database: 'yestravel_test',
      });
      await ds.initialize();
      await ds.destroy();
      return;
    } catch {
      await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
    }
  }
  throw new Error('PostgreSQL 테스트 컨테이너가 30초 내에 시작되지 않았습니다');
}

export default async function globalSetup(): Promise<void> {
  // 컨테이너가 이미 실행 중인지 확인 (로컬 개발 재사용)
  try {
    const result = execSync(
      `docker inspect --format='{{.State.Running}}' ${CONTAINER_NAME} 2>/dev/null`
    )
      .toString()
      .trim();
    if (result !== 'true') throw new Error('실행 중 아님');
    console.log(
      '테스트 PostgreSQL 컨테이너가 이미 실행 중입니다. 재사용합니다...'
    );
  } catch {
    console.log('테스트 PostgreSQL 컨테이너를 시작합니다...');
    execSync(`docker compose -f ${DOCKER_COMPOSE_FILE} up -d`, {
      cwd: process.cwd().includes('apps/api')
        ? process.cwd()
        : `${process.cwd()}/apps/api`,
      stdio: 'inherit',
    });
  }

  await waitForPostgres();
  console.log('PostgreSQL 테스트 컨테이너가 준비되었습니다');

  // Migration 실행
  const ds = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 55432,
    username: 'postgres',
    password: 'postgres',
    database: 'yestravel_test',
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    migrationsRun: true,
    entities: ['src/module/**/*.entity.ts'],
    migrations: ['src/database/migration/*.ts'],
  });

  await ds.initialize();
  console.log('Migration이 완료되었습니다');
  await ds.destroy();
}
