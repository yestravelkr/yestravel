---
name: Backoffice Auth
description: 백오피스 인증 상태 관리 - Zustand 기반 로그인/로그아웃, 토큰 관리
keywords: [backoffice, auth, 인증, 로그인, 토큰, refreshToken, Zustand, authStore]
---

# Backoffice Auth

백오피스 프론트엔드의 인증 상태를 Zustand store로 관리한다. 사용자 정보, 역할(Role), 액세스 토큰을 저장하며 토큰 갱신 및 로그아웃 처리를 담당한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/store/authStore.ts | 인증 상태 관리 스토어 | useAuthStore(), Role enum |

## 핵심 흐름

1. 로그인 → `login()` → user, accessToken, role 상태 설정
2. 토큰 만료 → `refreshToken()` → `VITE_API_BASEURL/trpc/backofficeAuth.refresh` POST 요청 → 새 accessToken 갱신
3. 토큰 갱신 실패 → 자동 로그아웃 (상태 초기화)
4. 로그아웃 → `logout()` → 상태 초기화 (user: null, role: GUEST)

## 주요 설계

- **상태 관리**: Zustand `create()` 사용
- **Role 체계**: ADMIN, MANAGER, GUEST (enum)
- **API Base URL**: `import.meta.env.VITE_API_BASEURL` 환경변수 사용 (fallback: `http://localhost:3000`)
- **인증 방식**: Cookie 기반 (`credentials: 'include'`) + accessToken 조합

## 관련 Business Context

- [백오피스 인증](../business/backoffice-authentication.md)
