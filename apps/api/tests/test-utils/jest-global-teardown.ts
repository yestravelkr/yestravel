import { execSync } from 'child_process';

const DOCKER_COMPOSE_FILE = 'docker/docker-compose.test.yml';

export default async function globalTeardown(): Promise<void> {
  // CI 환경에서만 종료 (GitHub Actions는 CI=true 설정)
  if (process.env.CI === 'true') {
    console.log('CI 환경 감지, 테스트 컨테이너를 종료합니다...');
    execSync(`docker compose -f ${DOCKER_COMPOSE_FILE} down -v`, {
      cwd: process.cwd().includes('apps/api')
        ? process.cwd()
        : `${process.cwd()}/apps/api`,
      stdio: 'inherit',
    });
  } else {
    console.log('로컬 개발: 테스트 컨테이너를 재사용을 위해 계속 실행합니다');
  }
}
