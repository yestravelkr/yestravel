---
name: Influencer
description: 백오피스 인플루언서 관리 - CRUD, 소셜미디어/사업자/정산 정보 관리
keywords: [인플루언서, influencer, 소셜미디어, 파트너, 사업자정보, 정산계좌]
---

# Influencer 모듈

백오피스에서 인플루언서를 등록/수정/조회/삭제하는 기능을 제공한다. 인플루언서는 캠페인과 연결되어 여행 상품을 홍보하는 파트너이다.

## 파일 구조

### Backend (API)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/influencer/influencer.schema.ts | Zod 유효성 검증 스키마 | createInfluencerInputSchema, updateInfluencerInputSchema, influencerListSchema, influencerManagerSchema, createInfluencerManagerInputSchema |
| apps/api/src/module/backoffice/influencer/influencer.dto.ts | TypeScript 타입 (스키마 기반 추론) | CreateInfluencerInput, UpdateInfluencerInput, CreateInfluencerManagerInput, DeleteInfluencerManagerInput, UpdateInfluencerManagerRoleInput |
| apps/api/src/module/backoffice/influencer/influencer.router.ts | tRPC 라우터 정의 | backofficeInfluencer.create, .update, .getById, .getList, .createManager, .findManagers, .deleteManager, .updateManagerRole |
| apps/api/src/module/backoffice/influencer/influencer.controller.ts | NestJS 메시지 패턴 핸들러 | InfluencerController |
| apps/api/src/module/backoffice/influencer/influencer.service.ts | 비즈니스 로직 (CRUD) | InfluencerService |
| apps/api/src/module/backoffice/influencer/influencer.module.ts | 모듈 설정 | InfluencerModule |

### Entity

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/domain/influencer.entity.ts | 인플루언서 엔티티 (PartnerEntity 상속) | InfluencerEntity, existsByName(), existsBySlug(), validateExistsByIds() |
| apps/api/src/module/backoffice/domain/social-media.entity.ts | 소셜미디어 엔티티 (1:N) | SocialMediaEntity |
| apps/api/src/module/backoffice/domain/influencer-manager.entity.ts | 인플루언서 매니저 (1:N) | InfluencerManagerEntity |

### Frontend (Backoffice)

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/routes/_auth/influencer/index.tsx | 인플루언서 목록 페이지 | InfluencerListPage |
| apps/backoffice/src/routes/_auth/influencer/create.tsx | 인플루언서 등록 페이지 | InfluencerCreatePage |
| apps/backoffice/src/routes/_auth/influencer/$influencerId.tsx | 인플루언서 상세/수정 페이지 | InfluencerDetailPage |
| apps/backoffice/src/routes/_auth/influencer/_components/InfluencerForm.tsx | 등록/수정 공용 폼 컴포넌트 | InfluencerForm |
| apps/backoffice/src/routes/_auth/influencer/_components/InfluencerList.tsx | 목록 테이블 컴포넌트 | InfluencerList |

## 핵심 흐름

1. **등록**: InfluencerForm → tRPC backofficeInfluencer.create → InfluencerController → InfluencerService → InfluencerEntity + SocialMediaEntity 저장
2. **수정**: InfluencerForm → tRPC backofficeInfluencer.update → InfluencerController → InfluencerService → 기존 엔티티 업데이트
3. **조회**: 목록 페이지 → tRPC backofficeInfluencer.getList → 페이지네이션 + 검색
4. **상세**: 상세 페이지 → tRPC backofficeInfluencer.getById → 전체 정보 반환

## 유효성 검증

| 필드 | 조건 | 비고 |
|------|------|------|
| name | 필수, 고유값 | existsByName()으로 중복 검사 |
| slug (shop URL) | 필수, 고유값 | unique index |
| email | 필수, 이메일 형식 | 최근 필수값으로 변경 |
| socialMedias | 최소 1개 | 플랫폼: INSTAGRAM, TIKTOK, YOUTUBE, FACEBOOK, TWITTER, OTHER |

## 연관 엔티티

- **CampaignInfluencerEntity**: 캠페인-인플루언서 매핑
- **InfluencerSettlementEntity**: 인플루언서 정산
- **CampaignInfluencerHotelOptionEntity**: 캠페인 호텔 옵션
- **CampaignInfluencerProductEntity**: 캠페인 상품

## 관련 Codebase Context

- [Partner Admin](./partner-admin.md) - 매니저 CRUD 통합 모듈 (Strategy Pattern)

## 관련 Business Context

- [인플루언서 관리](../business/influencer-management.md)
