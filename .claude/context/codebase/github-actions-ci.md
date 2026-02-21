---
name: github-actions-ci
description: GitHub Actions CI 파이프라인 - PR 통합 테스트 + Shop 빌드 체크 워크플로우
keywords: [CI, CD, GitHub Actions, 통합테스트, integration test, workflow, Docker, PostgreSQL, Shop, 빌드, build]
estimated_tokens: ~400
---

# GitHub Actions CI

PR 통합 테스트와 Shop 앱 빌드 체크를 실행하는 GitHub Actions 워크플로우 모음이다. 통합 테스트는 Docker Compose로 외부 의존성을 구동하여 Service Layer를 검증하고, Shop 빌드 체크는 모든 push에서 프론트엔드 빌드 정상 여부를 확인한다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .github/workflows/test.yml | 통합 테스트 워크플로우 정의 | on: pull_request (main 브랜치 대상) |
| .github/workflows/build-shop.yml | Shop 앱 빌드 체크 워크플로우 | on: push (모든 브랜치) |
| apps/api/docker/docker-compose.test.yml | 테스트용 Docker Compose | PostgreSQL 등 테스트 인프라 |
| apps/api/jest.integration.config.ts | Jest 통합 테스트 설정 | 통합 테스트 실행 구성 |
| apps/api/config/test.js | 테스트 환경 설정 | NODE_ENV=test 환경 변수 |

## 핵심 흐름

### 통합 테스트 실행

1. PR 이벤트(opened, synchronize, reopened) 발생 -> 워크플로우 트리거
2. `actions/checkout@v4` -> `actions/setup-node@v4` (.nvmrc 기반) -> `yarn install --frozen-lockfile`
3. `yarn docker:test:up` (apps/api) -> Docker Compose로 테스트 DB 등 서비스 기동
4. `yarn test:integration` (apps/api, NODE_ENV=test) -> Jest 통합 테스트 실행
5. `yarn docker:test:down` (always) -> 테스트 인프라 정리
6. `actions/upload-artifact@v4` -> 커버리지 리포트 업로드 (if-no-files-found: ignore)

### Shop 빌드 체크

1. push 이벤트 발생 (모든 브랜치) -> 워크플로우 트리거
2. `actions/checkout@v4` -> `actions/setup-node@v4` (Node.js 22.16.x) -> yarn 캐시 설정
3. `yarn install` -> 전체 의존성 설치
4. apps/shop/.env 파일 생성 (VITE_API_BASEURL 설정)
5. `yarn build` (apps/shop) -> Shop 프론트엔드 빌드 실행

## 주요 설계 결정

- **main 브랜치 대상 PR만 통합 테스트 실행**: 불필요한 CI 비용 방지
- **always() 조건 정리**: 테스트 실패 시에도 Docker 서비스 정리 보장
- **커버리지 선택적 업로드**: 커버리지 파일 미존재 시 무시 (if-no-files-found: ignore)
- **Shop 빌드는 모든 push에서 실행**: 빌드 깨짐을 조기 감지하여 프론트엔드 안정성 확보
- **yarn 캐시 활용**: Shop 빌드 시 yarn 캐시를 사용하여 CI 속도 최적화

## 관련 Business Context

- [품질 보증](../business/quality-assurance.md)
