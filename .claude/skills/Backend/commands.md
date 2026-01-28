---
name: Backend-commands
description: YesTravel 개발 명령어 모음. API, 백오피스, Docker 명령어.
keywords: [명령어, yarn, npm, dev, build, test, lint, migration, docker]
estimated_tokens: ~200
---

# 개발 명령어

## 루트 레벨 (Monorepo)

```bash
yarn lint              # 모든 워크스페이스 린팅
yarn lint:fix          # 린팅 문제 수정
```

## API 서버 (apps/api)

### 개발

```bash
yarn dev               # 개발 서버 시작 (3000 포트)
yarn build             # 빌드
yarn start             # 프로덕션 서버 시작
yarn generateEnv       # .env 파일 생성
```

### 테스트

```bash
yarn test              # 단위 테스트
yarn test:watch        # 감시 모드 테스트
yarn test:e2e          # E2E 테스트
yarn test:cov          # 커버리지 리포트
```

### 데이터베이스

```bash
yarn migration:create <name>     # 마이그레이션 생성
yarn migration:generate <name>   # 엔티티에서 생성
yarn migration:run               # 마이그레이션 실행
yarn migration:revert            # 마지막 마이그레이션 되돌리기
```

## 백오피스 (apps/backoffice)

```bash
yarn dev               # Vite 개발 서버
yarn build             # 프로덕션 빌드
yarn preview           # 빌드 미리보기
yarn lint              # ESLint 실행
```

## Docker (docker/)

```bash
./startDocker.sh       # 서비스 시작
docker-compose up -d   # 백그라운드 시작
docker-compose down    # 서비스 중지
```

## 전체 개발 시작

```bash
cd docker && ./startDocker.sh && cd ../apps/api && yarn generateEnv && yarn migration:run && yarn dev
```
