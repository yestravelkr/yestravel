---
name: backoffice-campaign
description: 백오피스 캠페인 CRUD - 인플루언서 수수료, 날짜별 호텔옵션 커미션, 상품 판매 설정
keywords: [campaign, 캠페인, influencer, 인플루언서, fee, 수수료, commission, 커미션, hotelOption, 호텔옵션, commissionByDate]
estimated_tokens: ~700
---

# Backoffice Campaign 모듈

캠페인 CRUD 및 인플루언서별 수수료/커미션 관리를 담당하는 NestJS 서비스 모듈이다. 인플루언서별 고정 수수료(fee)와 호텔 옵션별 날짜 기반 커미션(commissionByDate)을 지원한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/campaign/campaign.module.ts | 모듈 정의 | CampaignModule |
| apps/api/src/module/backoffice/campaign/campaign.service.ts | 비즈니스 로직 | CampaignService.create(), update(), findAll(), findOne() |
| apps/api/src/module/backoffice/campaign/campaign.controller.ts | MessagePattern 핸들러 | CampaignController |
| apps/api/src/module/backoffice/campaign/campaign.router.ts | tRPC 라우터 | CampaignRouter extends BaseTrpcRouter |
| apps/api/src/module/backoffice/campaign/campaign.schema.ts | Zod 스키마 | 입력/출력 validation |
| apps/api/src/module/backoffice/campaign/campaign.type.ts | 타입 추론 | CreateCampaignInput, UpdateCampaignInput |
| apps/api/src/module/backoffice/campaign/campaign.dto.ts | DTO/응답 인터페이스 | CampaignDetailResponse |
| apps/api/src/module/backoffice/campaign/campaign.service.spec.ts | 단위 테스트 | 인플루언서 수수료 저장 검증 7건 |

## 엔티티 관계

```
Campaign (id)
├── CampaignProduct (campaign_id FK)
│   └── Product (product_id FK)
└── CampaignInfluencer (composite PK: ${campaignId}_${influencerId})
    ├── Influencer (influencer_id FK)
    └── CampaignInfluencerProduct (campaign_influencer_id FK)
        ├── Product (product_id FK)
        └── CampaignInfluencerHotelOption (campaign_influencer_product_id FK)
            ├── HotelOption (hotel_option_id FK)
            └── Influencer (influencer_id FK, 비정규화)
```

## 엔티티 파일 위치

| 엔티티 | 파일 |
|--------|------|
| CampaignEntity | apps/api/src/module/backoffice/domain/campaign.entity.ts |
| CampaignInfluencerEntity | apps/api/src/module/backoffice/domain/campaign-influencer.entity.ts |
| CampaignInfluencerProductEntity | apps/api/src/module/backoffice/domain/campaign-influencer-product.entity.ts |
| CampaignInfluencerHotelOptionEntity | apps/api/src/module/backoffice/domain/campaign-influencer-hotel-option.entity.ts |
| CampaignProductEntity | apps/api/src/module/backoffice/domain/campaign-product.entity.ts |

## 핵심 흐름

### 캠페인 생성 (create)

1. Product/Influencer 존재 검증 → `validateExistsByIds()`
2. Campaign 엔티티 생성 및 저장
3. CampaignProduct 생성 (병렬)
4. CampaignInfluencer 생성 (순차, reduce 패턴):
   - CampaignInfluencer 생성 (feeType, fee, periodType, status)
   - CampaignInfluencerProduct 생성 (useCustomCommission, status)
   - CampaignInfluencerHotelOption 생성 (hotelOptionId, commissionByDate)
5. 관계 로드 후 응답 반환

### 캠페인 수정 (update)

1. `deleteRelatedEntities()` → 기존 HotelOption → Product → Influencer 순서 삭제
2. 생성과 동일한 흐름으로 재생성

### 인플루언서 수수료 구조

| 레벨 | 엔티티 | 필드 | 설명 |
|------|--------|------|------|
| 인플루언서 고정비 | CampaignInfluencer | feeType, fee | NONE 또는 CUSTOM 금액 |
| 상품별 커미션 활성화 | CampaignInfluencerProduct | useCustomCommission | boolean |
| 호텔옵션별 날짜 커미션 | CampaignInfluencerHotelOption | commissionByDate | JSONB: {"YYYY-MM-DD": number} |

## 테스트 커버리지

| 카테고리 | 테스트 수 | 주요 검증 |
|----------|----------|----------|
| 생성 - 호텔옵션 수수료 | 1건 | commissionByDate 저장 |
| 생성 - useCustomCommission | 1건 | 커스텀 커미션 플래그 |
| 생성 - 상품 status | 1건 | HIDDEN/VISIBLE 상태 저장 |
| 생성 - 빈 hotelOptions | 1건 | 호텔옵션 미생성 확인 |
| 생성 - 인플루언서 없음 | 1건 | 관련 엔티티 미생성 확인 |
| 수정 - 수수료 재생성 | 1건 | 기존 삭제 후 새로운 커미션 저장 |
| 수정 - 존재하지 않는 캠페인 | 1건 | NotFoundException |

## 주요 설계 결정

- **Composite PK**: CampaignInfluencer.id = `"${campaignId}_${influencerId}"`
- **비정규화**: CampaignInfluencerHotelOption에 influencerId 저장 (쿼리 편의)
- **JSONB**: commissionByDate를 JSONB로 저장하여 유연한 날짜별 커미션 매핑
- **N+1 방지**: batch 로딩 + Map 그룹핑 (loadCategoriesForCampaignProducts, loadInfluencerProducts)

## 관련 Business Context

- [캠페인 인플루언서 수수료](../business/campaign-influencer-fee.md)
