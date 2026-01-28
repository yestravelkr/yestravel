---
name: domain-campaign
description: 인플루언서 마케팅 캠페인 구조. ERD, 데이터 흐름, 수수료 계산.
keywords: [캠페인, 인플루언서, 수수료, 커미션, 판매링크, 정산]
estimated_tokens: ~400
---

# Campaign 구조

## 핵심 기능

- 캠페인별 상품 및 인플루언서 관리
- 인플루언서별 맞춤 수수료 설정
- 판매 링크 생성 및 주문 추적
- 정산 데이터 관리

## URL 구조

```
/influencer/{influencerId}                         → 캠페인 목록
/influencer/{influencerId}/campaign/{campaignId}   → 상품 목록
/sale/{campaignInfluencerProductId}                → 상품 상세
```

## ERD

```
Campaign ─┬─ CampaignProduct ── Product
          │
          └─ CampaignInfluencer ── Influencer
                │
                └─ CampaignInfluencerProduct
                        │
                        └─ CampaignHotelOption ── HotelOption
```

## 주요 엔티티

### CampaignInfluencer

| 컬럼 | 설명 |
|------|------|
| periodType | DEFAULT (캠페인 기간) / CUSTOM (직접 입력) |
| feeType | NONE (없음) / CUSTOM (직접 입력) |
| fee | 진행비 |
| status | VISIBLE / HIDDEN / SOLDOUT |

### CampaignInfluencerProduct

- `campaignInfluencerId`: 캠페인-인플루언서 연결
- `productId`: 상품
- `useCustomCommission`: 별도 수수료 사용 여부
- **URL**: `/sale/{id}` 형태로 판매 링크 생성

### CampaignHotelOption

- `hotelOptionId`: 원본 HotelOption 참조
- `commissionByDate`: 날짜별 커스텀 수수료 `Record<string, number>`

## 수수료 결정 로직

```typescript
// 1. 커스텀 수수료 확인
const customOption = await getCampaignHotelOption(
  campaignInfluencerProductId,
  hotelOptionId
);

// 2. 커스텀 있으면 커스텀, 없으면 기본값
const commission = customOption?.commissionByDate[date]
  ?? defaultHotelOption.anotherPriceByDate[date].commission;

// 3. Order에 스냅샷 저장
```

## 참조 vs 복사 전략

| 데이터 | 전략 | 이유 |
|--------|------|------|
| 상품명/인플루언서명 | 참조 | 원본 수정 시 반영 |
| 상품 가격 | 참조 | HotelOption에서 조회 |
| 인플루언서 기간/진행비 | 저장 | 인플루언서별로 다름 |
| 커스텀 수수료 | 저장 | 인플루언서별로 다름 |
| 주문 시 가격/수수료 | 스냅샷 | 정산 시점 기준 보장 |
