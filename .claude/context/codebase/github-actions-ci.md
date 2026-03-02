---
name: github-actions-ci
description: GitHub Actions CI 파이프라인 - PR 트리거 통합 테스트 워크플로우
keywords: [CI, CD, GitHub Actions, 통합테스트, integration test, workflow, Docker, PostgreSQL]
estimated_tokens: ~300
---

# GitHub Actions CI

PR 생성/업데이트 시 자동으로 통합 테스트를 실행하는 GitHub Actions 워크플로우이다. Docker Compose로 PostgreSQL 등 외부 의존성을 구동한 뒤, Service Layer 통합 테스트를 수행하고 커버리지를 수집한다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .github/workflows/test.yml | 통합 테스트 워크플로우 정의 | on: pull_request (main 브랜치 대상) |
| .github/workflows/build-partner.yml | Partner 앱 빌드 워크플로우 | on: push (모든 브랜치) |
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

### Partner 앱 빌드

1. Push 이벤트 발생 → 워크플로우 트리거
2. `actions/checkout@v4` → `actions/setup-node@v4` (Node 22.16.x) → `yarn install`
3. `apps/partner/.env` 생성 (VITE_API_BASEURL 설정)
4. `yarn build` (apps/partner) → Vite 빌드 + TypeScript 컴파일

## 주요 설계 결정

- **main 브랜치 대상 PR만 실행 (테스트)**: 불필요한 CI 비용 방지
- **모든 브랜치 Push에서 빌드 (Partner)**: 빌드 성공 여부 조기 확인
- **always() 조건 정리**: 테스트 실패 시에도 Docker 서비스 정리 보장
- **커버리지 선택적 업로드**: 커버리지 파일 미존재 시 무시 (if-no-files-found: ignore)

## 관련 Business Context

- [품질 보증](../business/quality-assurance.md)
