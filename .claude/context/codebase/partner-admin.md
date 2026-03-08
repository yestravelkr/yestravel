---
name: Partner Admin
description: 파트너 매니저 CRUD - Strategy Pattern으로 Brand/Influencer 분기, 백오피스 + 파트너 포털 공용
keywords: [Partner, 파트너, 매니저, Manager, CRUD, Strategy, Brand, Influencer, admin]
estimated_tokens: ~400
---

# Partner Admin

브랜드/인플루언서 매니저(Staff)를 생성, 조회, 삭제, 권한 변경하는 통합 모듈이다. Strategy Pattern으로 파트너 유형별 로직을 분리하며, 백오피스 관리자와 파트너 자체 포털 양쪽에서 사용한다.

## 파일 구조

### 통합 서비스 (Strategy Pattern)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/admin/admin.module.ts | Admin 모듈 | AdminModule |
| apps/api/src/module/backoffice/admin/partner-admin.controller.ts | MessagePattern 핸들러 | PartnerAdminController - createManager, findManagers, deleteManager, findManagerById, updateManagerRole |
| apps/api/src/module/backoffice/admin/partner-admin.service.ts | 통합 서비스 (Strategy 위임) | PartnerAdminService - Strategy Factory로 파트너 유형별 구현체에 위임 |
| apps/api/src/module/backoffice/admin/partner-admin.schema.ts | Zod 스키마 | createPartnerManagerInputSchema, partnerManagerListSchema, updatePartnerManagerRoleInputSchema 등 |

### Strategy 구현체

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/admin/strategy/partner-manager.strategy.ts | Strategy 인터페이스 | PartnerManagerStrategy - getSupportedType, createManager, findManagers, deleteManager, findManagerById, updateManagerRole |
| apps/api/src/module/backoffice/admin/strategy/partner-manager-strategy.factory.ts | Strategy Factory | PartnerManagerStrategyFactory - getStrategy(type) |
| apps/api/src/module/backoffice/admin/strategy/brand-manager.strategy.ts | Brand 매니저 구현 | BrandManagerStrategy implements PartnerManagerStrategy |
| apps/api/src/module/backoffice/admin/strategy/influencer-manager.strategy.ts | Influencer 매니저 구현 | InfluencerManagerStrategy implements PartnerManagerStrategy |

### Entity

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/domain/brand-manager.entity.ts | Brand 매니저 Entity | BrandManagerEntity extends LoginEntity - create(), update(), updatePassword() |
| apps/api/src/module/backoffice/domain/influencer-manager.entity.ts | Influencer 매니저 Entity | InfluencerManagerEntity extends LoginEntity - create(), update(), updatePassword() |

### tRPC Router (백오피스)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/brand/brand.router.ts | Brand Router | createManager, findManagers, deleteManager, updateManagerRole 추가 |
| apps/api/src/module/backoffice/influencer/influencer.router.ts | Influencer Router | createManager, findManagers, deleteManager, updateManagerRole 추가 |

### tRPC Router (파트너 포털)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/partner/account/partner-account.router.ts | Partner 계정 관리 | PartnerAccountRouter - createStaff, findAllStaff, deleteStaff, updateStaffRole, getProfile |
| apps/api/src/module/partner/account/partner-account.schema.ts | Partner 계정 스키마 | createStaffInputSchema, deleteStaffInputSchema, profileOutputSchema |

## 핵심 흐름

### 매니저 생성

1. 백오피스 또는 파트너 포털 → `partner.admin.createManager` MessagePattern 호출
2. `PartnerAdminService` → `StrategyFactory.getStrategy(partnerType)` → Brand 또는 Influencer Strategy
3. Strategy 구현체 → 해당 Entity 생성 → Repository 저장

### MessagePattern 매핑

| MessagePattern | 기능 |
|----------------|------|
| partner.admin.createManager | 매니저 생성 |
| partner.admin.findManagers | 매니저 목록 조회 |
| partner.admin.deleteManager | 매니저 삭제 |
| partner.admin.findManagerById | 매니저 상세 조회 |
| partner.admin.updateManagerRole | 매니저 권한 변경 |

### 권한 체크

| 진입점 | 허용 Role |
|--------|----------|
| 백오피스 Brand/Influencer Router | Backoffice 관리자 (BackofficeAuthMiddleware) |
| Partner Account Router | PARTNER_SUPER, ADMIN_SUPER, ADMIN_STAFF |

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
