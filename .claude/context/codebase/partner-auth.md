---
name: Partner Auth
description: 파트너 전용 JWT 인증 - 로그인, 토큰 갱신, 미들웨어, 쿠키 기반 refresh token
keywords: [Partner, 파트너, 인증, JWT, 로그인, 토큰, 미들웨어, auth, cookie, refresh]
estimated_tokens: ~400
---

# Partner Auth

파트너(브랜드/인플루언서)가 전용 포털에 로그인하고 API를 호출할 수 있도록 JWT 기반 인증을 제공한다. Backoffice 인증과 별도의 JWT 시크릿을 사용하며, refreshToken은 httpOnly 쿠키로 관리한다.

## 파일 구조

### tRPC Router (클라이언트 → API)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/partner/auth/partner-auth.router.ts | Partner 인증 tRPC Router | PartnerAuthRouter - login(), refresh(), logout() |
| apps/api/src/module/partner/auth/partner-auth.schema.ts | Partner 인증 타입 정의 | PartnerType ('BRAND' \| 'INFLUENCER'), PartnerAuthPayload, partnerTypeSchema |
| apps/api/src/module/partner/auth/partner-auth.middleware.ts | Partner JWT 인증 미들웨어 | PartnerAuthMiddleware - Bearer 토큰 검증, ctx.partner 주입 |
| apps/api/src/module/partner/partner.module.ts | Partner NestJS 모듈 | PartnerModule |

### NestJS Controller/Service (API 내부)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/auth/backoffice.auth.controller.ts | 인증 MessagePattern 핸들러 | BackofficeAuthController - partnerLogin (partner.auth.login), partnerRefresh (partner.auth.refresh) |
| apps/api/src/module/backoffice/auth/backoffice.auth.service.ts | 인증 비즈니스 로직 | BackofficeAuthService - partnerLogin(), partnerRefreshToken(), findBrandManager(), findInfluencerManager() |

### 설정

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/config/default.js | Production JWT 설정 | auth.jwt.partner (access: 1h, refresh: 30d) |
| apps/api/config/localdev.js | 로컬 개발 JWT 설정 | auth.jwt.partner (access/refresh secret) |
| apps/api/src/config.ts | 타입 안전 설정 Provider | ConfigProvider.auth.jwt.partner |

## 핵심 흐름

### 로그인

1. 클라이언트 → `PartnerAuthRouter.login(email, password, partnerType)` 호출
2. `BackofficeAuthService.partnerLogin()` → partnerType에 따라 BrandManager 또는 InfluencerManager 조회
3. 비밀번호 검증 → JWT 발급 (PartnerAuthPayload: id, email, partnerType, role, partnerId)
4. accessToken은 응답 body, refreshToken은 httpOnly 쿠키에 설정

### 인증된 API 호출

1. 클라이언트 요청 → `PartnerAuthMiddleware` → Bearer 토큰 검증
2. JWT에서 `PartnerAuthPayload` 추출 → `ctx.partner`에 주입
3. 보호된 라우터에서 `ctx.partner.partnerType`, `ctx.partner.role` 등 참조

### 토큰 갱신

1. 클라이언트 → `PartnerAuthRouter.refresh()` 호출 (쿠키에서 refreshToken 자동 전송)
2. `BackofficeAuthService.partnerRefreshToken()` → 새 accessToken + refreshToken 발급

## PartnerAuthPayload 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | Manager Entity ID |
| email | string | 로그인 이메일 |
| partnerType | 'BRAND' \| 'INFLUENCER' | 파트너 유형 |
| role | string | 권한 (PARTNER_SUPER, PARTNER_STAFF 등) |
| partnerId | number | 소속 Brand/Influencer ID |

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
