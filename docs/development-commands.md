# 개발 명령어

이 문서는 YesTravel 프로젝트에서 사용 가능한 모든 개발 명령어를 포함합니다.

## 루트 레벨 명령어 (Monorepo)

```bash
# 린팅
yarn lint              # 모든 워크스페이스에서 린팅 실행
yarn lint:fix           # 모든 워크스페이스의 린팅 문제 수정
```

## API 서버 명령어 (apps/api)

### 개발
```bash
yarn dev                # 핫 리로드로 개발 서버 시작 (.env 생성 후 3000 포트에서 실행)
yarn build              # 애플리케이션 빌드
yarn start              # 프로덕션 서버 시작
yarn start:prod         # 환경 변수 생성과 함께 프로덕션 서버 시작
```

### 테스트
```bash
yarn test               # 단위 테스트 실행
yarn test:watch         # 감시 모드에서 테스트 실행
yarn test:e2e           # End-to-End 테스트 실행
yarn test:cov           # 커버리지와 함께 테스트 실행
```

### 코드 품질
```bash
yarn lint               # ESLint 자동 수정과 함께 실행
```

### 환경 설정
```bash
yarn generateEnv        # 환경 변수 생성 (yarn dev에서 자동으로 실행됨)
```

## 데이터베이스 명령어 (apps/api)

```bash
# 마이그레이션 관리
yarn migration:create <name>     # 새 마이그레이션 생성
yarn migration:generate <name>   # 엔티티 변경사항으로부터 마이그레이션 생성
yarn migration:run               # 대기중인 마이그레이션 실행
yarn migration:revert            # 마지막 마이그레이션 되돌리기
```

## 백오피스 프론트엔드 명령어 (apps/backoffice)

```bash
# 개발
yarn dev                # Vite 개발 서버 시작
yarn build              # 프로덕션용 빌드
yarn preview            # 프로덕션 빌드 미리보기

# 코드 품질
yarn lint               # ESLint 실행
```

## Docker 명령어

```bash
# docker/ 디렉토리에서
./startDocker.sh        # Docker 서비스 시작 (PostgreSQL)

# docker-compose 직접 사용
docker-compose up -d    # 백그라운드에서 서비스 시작
docker-compose down     # 서비스 중지
```

## Claude Code를 위한 중요 사항

- API 시작 전에 환경 변수가 생성되도록 항상 `yarn generateEnv` 또는 `yarn dev`를 실행하세요
- tRPC 서버는 3000 포트에서 실행됩니다
- 핫 리로드를 위해 API 디렉토리에서 `yarn dev`를 사용하세요
- 개발 시작 전에 데이터베이스 마이그레이션을 실행해야 합니다
- PostgreSQL 데이터베이스를 위해 Docker 설정이 필요합니다

## 명령어 실행 컨텍스트

이러한 명령어 사용 시:
- 루트 레벨 명령어는 저장소 루트에서 실행해야 합니다
- API 명령어는 `apps/api/` 디렉토리에서 실행해야 합니다
- 백오피스 명령어는 `apps/backoffice/` 디렉토리에서 실행해야 합니다
- Docker 명령어는 `docker/` 디렉토리 또는 저장소 루트에서 실행해야 합니다