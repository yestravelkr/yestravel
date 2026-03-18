---
name: backoffice-auth
description: Backoffice 인증 시스템 - Admin/Partner 듀얼 JWT, 역할 기반 접근 제어 (AllowRoles)
keywords: [인증, Auth, JWT, AllowRoles, RBAC, AuthType, AuthLevel, Partner, Admin, middleware]
estimated_tokens: ~400
---

# Backoffice Auth

Admin과 Partner(Brand/Influencer)를 통합 인증하는 듀얼 JWT 시스템이다. `apps/api/src/module/backoffice/auth/`에 위치하며, tRPC 미들웨어로 동작한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| backoffice.auth.middleware.ts | tRPC 미들웨어 - JWT 검증, 듀얼 토큰 | BackofficeAuthMiddleware, BackofficeAuthorizedContext |
| backoffice.auth.service.ts | 인증 서비스 - 로그인, JWT 발급 | BackofficeAuthService, AuthType, AuthLevel, resolveAuthLevel, AdminAuthPayload |
| backoffice.auth.router.ts | tRPC 라우터 | BackofficeAuthMiddleware 사용 |
| backoffice.auth.controller.ts | NestJS 마이크로서비스 컨트롤러 | BackofficeAuthController |
| backoffice.auth.module.ts | NestJS 모듈 | BackofficeAuthModule |
| ../partner/auth/partner-auth.schema.ts | Partner 인증 스키마 | PartnerAuthPayload, PartnerType, PARTNER_TYPE_VALUE |
| ../../shared/auth/allow-roles.decorator.ts | RBAC 데코레이터 | AllowRoles(types, level) |

## 핵심 흐름

### 듀얼 JWT 인증

1. 요청 헤더에서 Bearer 토큰 추출
2. Admin JWT secret으로 검증 시도 → 성공 시 `authType = 'ADMIN'`
3. 실패 시 Partner JWT secret으로 검증 시도 → 성공 시 `authType = partnerType('BRAND' | 'INFLUENCER')`
4. Partner 토큰의 `partnerType`이 유효한지 `PARTNER_TYPE_VALUE`로 검증
5. `resolveAuthLevel(role)` → role이 `_SUPER`로 끝나면 `'SUPER'`, 아니면 `'STAFF'`
6. `AdminAuthPayload`를 context에 주입 (`admin` 필드)

### AllowRoles RBAC

1. `@AllowRoles(['ADMIN'], 'STAFF')` → Admin만 접근, Staff 이상
2. `@AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'])` → 모든 인증 사용자 접근
3. `@AllowRoles(['BRAND'], 'SUPER')` → Brand 파트너 중 Super만 접근
4. 타입 확인 → `admin.authType`이 허용 목록에 포함되는지
5. 레벨 확인 → `admin.authLevel`이 최소 레벨 이상인지 (STAFF < SUPER)

### 타입 정의

- `AuthType`: `'ADMIN' | 'BRAND' | 'INFLUENCER'` (PartnerType 재사용)
- `AuthLevel`: `'SUPER' | 'STAFF'`
- `AdminAuthPayload`: `{ id, email, role, authType, authLevel, partnerId? }`
- `PartnerAuthPayload`: `{ id, email, partnerType, role, partnerId }`

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
