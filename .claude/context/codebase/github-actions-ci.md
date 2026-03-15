---
name: github-actions-ci
description: GitHub Actions CI/CD 파이프라인 - 통합 테스트, Partner 빌드, API 배포 워크플로우
keywords: [CI, CD, GitHub Actions, 통합테스트, integration test, workflow, Docker, PostgreSQL, 배포, deploy, ECR, Elastic Beanstalk, Buildx, GHA cache]
estimated_tokens: ~500
---

# GitHub Actions CI/CD

GitHub Actions 기반 CI/CD 파이프라인이다. PR 통합 테스트, Partner 앱 빌드, API 배포를 자동화한다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .github/workflows/test.yml | 통합 테스트 워크플로우 정의 | on: pull_request (main 브랜치 대상) |
| .github/workflows/build-partner.yml | Partner 앱 빌드 워크플로우 | on: push (모든 브랜치) |
| .github/workflows/deploy-api.yml | API 배포 워크플로우 | on: push (main, v* 태그), paths-ignore: 프론트엔드 앱들 |
| apps/api/docker/docker-compose.test.yml | 테스트용 Docker Compose | PostgreSQL 등 테스트 인프라 |
| apps/api/jest.integration.config.ts | Jest 통합 테스트 설정 | 통합 테스트 실행 구성 |
| apps/api/config/test.js | 테스트 환경 설정 | NODE_ENV=test 환경 변수 |
| apps/api/Dockerfile | API 서비스 Docker 이미지 | 배포용 컨테이너 빌드 |
| apps/api/Dockerrun.aws.json | Elastic Beanstalk 배포 설정 | ECR 이미지 태그 참조 템플릿 |

## 핵심 흐름

### 통합 테스트 실행

1. PR 이벤트(opened, synchronize, reopened) 발생 -> 워크플로우 트리거
2. `actions/checkout@v4` -> `actions/setup-node@v4` (.nvmrc 기반) -> `yarn install --frozen-lockfile`
3. `yarn docker:test:up` (apps/api) -> Docker Compose로 테스트 DB 등 서비스 기동
4. `yarn test:integration` (apps/api, NODE_ENV=test) -> Jest 통합 테스트 실행
5. `yarn docker:test:down` (always) -> 테스트 인프라 정리
6. `actions/upload-artifact@v4` -> 커버리지 리포트 업로드 (if-no-files-found: ignore)

### Partner 앱 빌드

1. Push 이벤트 발생 → 워크플로우 트리거
2. `actions/checkout@v4` → `actions/setup-node@v4` (Node 22.16.x) → `yarn install`
3. `apps/partner/.env` 생성 (VITE_API_BASEURL 설정)
4. `yarn build` (apps/partner) → Vite 빌드 + TypeScript 컴파일

### API 배포 (deploy-api.yml)

**Build Job:**
1. main push 또는 v* 태그 push → 워크플로우 트리거 (프론트엔드 앱 경로 변경은 무시)
2. `actions/checkout@v4` → `actions/setup-node@v4` (Node 22.16.x) → `yarn install --frozen-lockfile`
3. `yarn build` (apps/api) → NestJS 빌드
4. 환경 변수 결정: 태그 → staging, main push → develop (태그명에 타임스탬프 추가로 버전 중복 방지)
5. Docker Buildx로 이미지 빌드 → ECR push (GHA 캐시 활용: `--cache-from type=gha`, `--cache-to type=gha,mode=max`)
6. Dockerrun.aws.json에 태그 적용 → .ebextensions와 함께 zip → S3 업로드
7. Elastic Beanstalk 애플리케이션 버전 생성

**Deploy Job (develop만):**
1. Build Job 완료 후 실행 (STAGE=develop일 때만)
2. Elastic Beanstalk 환경 업데이트 (yestravel-api-development)

## 주요 설계 결정

- **main 브랜치 대상 PR만 실행 (테스트)**: 불필요한 CI 비용 방지
- **모든 브랜치 Push에서 빌드 (Partner)**: 빌드 성공 여부 조기 확인
- **always() 조건 정리**: 테스트 실패 시에도 Docker 서비스 정리 보장
- **커버리지 선택적 업로드**: 커버리지 파일 미존재 시 무시 (if-no-files-found: ignore)
- **Docker Buildx GHA 캐시**: GitHub Actions 캐시를 Docker 레이어 캐시로 활용하여 빌드 시간 단축
- **paths-ignore로 프론트엔드 변경 제외**: backoffice/partner/shop 변경 시 API 배포 불필요
- **develop만 자동 배포**: 태그(staging)는 버전 생성만 하고 수동 배포

## 관련 Business Context

- [품질 보증](../business/quality-assurance.md)
- [API 배포](../business/api-deployment.md)
