---
name: partner-app
description: Partner 앱 - 브랜드/인플루언서 파트너 전용 프론트엔드 (TanStack Router + tRPC + Zustand)
keywords: [Partner, 파트너, 브랜드, 인플루언서, 프론트엔드, TanStack Router, tRPC, Zustand, React]
estimated_tokens: ~400
---

# Partner App

브랜드/인플루언서 파트너가 로그인하여 각자의 대시보드를 이용하는 프론트엔드 애플리케이션이다. `apps/partner`에 위치하며, Vite + React 19 + TanStack Router + tRPC + Zustand 기반으로 구성된다. 개발 서버는 포트 3002에서 실행된다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/partner/src/main.tsx | React 루트 초기화 | StrictMode, TRPCProvider 래핑 |
| apps/partner/src/App.tsx | TanStack Router 설정 | createRouter(), RouterProvider |
| apps/partner/src/store/authStore.ts | 인증 상태 관리 (Zustand) | useAuthStore, login(), logout(), refreshToken(), setPartnerType() |
| apps/partner/src/shared/trpc/trpc.ts | tRPC 클라이언트 설정 | trpc, trpcClient, 401 자동 토큰 갱신 |
| apps/partner/src/shared/trpc/providers.tsx | tRPC + React Query 프로바이더 | TRPCProvider |
| apps/partner/src/shared/routes/authBeforeLoad.ts | 라우트 가드 (인증 체크) | authBeforeLoad() |
| apps/partner/src/components/login/LoginForm.tsx | 로그인 폼 | LoginForm, react-hook-form + Zod 검증 |
| apps/partner/src/components/login/LoginFormSchema.ts | 로그인 폼 스키마 | LoginFormSchema, LoginFormData |
| apps/partner/src/components/header.tsx | 상단 헤더 | Header |
| apps/partner/src/components/navigation/navigation.tsx | 사이드바 내비게이션 | Navigation (type별 메뉴 분기) |
| apps/partner/src/components/navigation/data.tsx | 내비게이션 데이터 | BRAND_NAV_GROUPS, INFLUENCER_NAV_GROUPS |
| apps/partner/src/components/navigation/type.ts | 내비게이션 타입 정의 | NavGroup, NavItem, NavLink, NavCollapsible |
| apps/partner/vite.config.ts | Vite 빌드 설정 | TanStackRouterVite, 경로 별칭 (@/) |
| apps/partner/tailwind.config.ts | Tailwind CSS 설정 | MinSans 폰트, 디자인 시스템 연동 |

## 핵심 흐름

### 인증 플로우

1. `/` (파트너 유형 선택) → 브랜드/인플루언서 카드 클릭 → `/login?type=brand|influencer`
2. 로그인 폼 제출 → `trpc.partnerAuth.login` 호출 → accessToken 저장 (authStore), refreshToken은 httpOnly 쿠키
3. 보호된 라우트 접근 시 `authBeforeLoad()` → 토큰 유효성 확인 → 실패 시 `trpc.partnerAuth.refresh` → 최종 실패 시 `/login` 리다이렉트
4. tRPC 클라이언트에서 401 응답 시 자동 토큰 갱신 후 요청 재시도

### 라우팅 구조

1. `/` → 파트너 유형 선택 페이지 (인증 불필요)
2. `/login` → 로그인 페이지 (search param: type)
3. `/brand` → 브랜드 파트너 레이아웃 (Header + Navigation + Outlet, authBeforeLoad 보호)
4. `/brand/` → 브랜드 대시보드
5. `/influencer` → 인플루언서 파트너 레이아웃 (authBeforeLoad 보호)
6. `/influencer/` → 인플루언서 대시보드

### 상태 관리

- `PartnerType`: BRAND | INFLUENCER (authStore에서 관리)
- `Role`: PARTNER_SUPER | PARTNER_STAFF (JWT PartnerAuthPayload에 포함)
- Zustand persist 없이 메모리 기반 관리, httpOnly 쿠키 refreshToken으로 세션 복원

## 관련 Codebase Context

- [Partner Auth](./partner-auth.md) - 백엔드 인증 모듈
- [Partner Admin](./partner-admin.md) - 매니저 CRUD 모듈

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
