---
name: shop-trpc-client
description: Shop 프론트엔드 tRPC 클라이언트 - API 통신, 인증 토큰 관리, 자동 갱신
keywords: [tRPC, client, auth, token, refresh, logout, shop, fetch, httpLink]
---

# Shop tRPC Client

Shop 프론트엔드의 tRPC 클라이언트 설정 모듈. API 통신, 인증 토큰 자동 갱신, 에러 핸들링을 담당한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/shop/src/shared/trpc/trpc.ts | tRPC 클라이언트 설정 및 인증 관리 | getApiUrl(), refreshAccessToken(), trpcClient |

## 핵심 흐름

1. `trpcClient` → `httpLink` 설정 → custom `fetch`로 모든 API 요청 처리
2. API 응답 401 수신 → `refreshAccessToken()` 호출 → 새 accessToken으로 원래 요청 재시도
3. refreshToken 갱신 실패 (401/403) → `useAuthStore`의 `logout()` 호출 → 로그인 페이지로 리다이렉트
4. 서버 에러 (5xx) → 1초 후 자동 재시도 (최대 1회)

## 주요 메커니즘

### 토큰 갱신 Race Condition 방지

- `refreshPromise` 변수로 진행 중인 갱신 요청 캐싱
- 동시 다발적 401 응답 시 단일 갱신 요청만 실행
- 갱신 완료 후 `refreshPromise = null`로 초기화

### API URL 동적 결정

- `getApiUrl()`: 환경(dev/prod)과 디바이스(웹/앱)에 따라 API URL 결정
- 개발 환경에서 앱 실행 시 IP 기반 URL 사용

### Hydration 상태 확인

- `useAuthStore`의 hydration 완료 전 토큰 갱신 시도 방지
- FinishHydration 전에는 빈 토큰으로 요청 발송

## 관련 Business Context

- [인증 관리](../business/authentication.md)
