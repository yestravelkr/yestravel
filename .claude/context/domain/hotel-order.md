---
name: domain-hotel-order
description: 호텔 상품 주문 구조. 날짜별 재고/가격 관리, HotelSku, HotelOption.
keywords: [호텔, 주문, 재고, 가격, 체크인, 체크아웃, HotelSku, HotelOption]
estimated_tokens: ~350
---

# 호텔 주문 구조

## 특징

- **날짜별 재고 관리** (HotelSku)
- **날짜별 가격 변동** (HotelOption)
- **체크인 날짜 기준** (체크아웃 날짜는 제외)

## ERD

```
ProductTemplate ── HotelSku (날짜별 재고)
Product ── HotelOption (날짜별 가격)
```

## HotelOption (날짜별 옵션 가격)

```typescript
interface HotelOption {
  id: number;
  name: string;
  priceByDate: Record<string, number>;  // { "YYYY-MM-DD": price }
}

// 예시
const breakfastOption: HotelOption = {
  id: 1,
  name: "조식 포함",
  priceByDate: {
    "2025-01-15": 15000,  // 평일
    "2025-01-16": 15000,
    "2025-01-17": 20000,  // 주말
  }
};
```

## HotelSku (날짜별 재고)

```typescript
interface HotelSku {
  id: number;
  quantity: number;
  date: string;  // YYYY-MM-DD (checkInDate)
}

// 예시: 2025-01-15 체크인 가능한 방 10개
const hotelSku: HotelSku = {
  id: 101,
  quantity: 10,
  date: "2025-01-15"
};
```

## 주문 플로우

### 1. 재고 확인

```typescript
// 1월 15일 체크인, 1월 17일 체크아웃 (2박)
// 확인 대상: 2025-01-15, 2025-01-16 (체크아웃 제외)

const requiredDates = ["2025-01-15", "2025-01-16"];
const allSkus = await hotelSkuRepository.find({
  where: {
    productTemplateId,
    checkInDate: In(requiredDates),
    quantity: MoreThan(0)
  }
});

if (allSkus.length !== requiredDates.length) {
  throw new Error("예약 불가");
}
```

### 2. 옵션 선택 및 가격 계산

```typescript
// 조식 옵션 선택 시 날짜별 가격 합산
const totalOptionPrice =
  selectedOption.priceByDate["2025-01-15"] +
  selectedOption.priceByDate["2025-01-16"];
// = 15,000 + 15,000 = 30,000원
```

### 3. 재고 차감

```typescript
// 각 날짜의 SKU에서 1개씩 차감
for (const date of requiredDates) {
  const sku = await hotelSkuRepository.findOne({
    where: { productTemplateId, checkInDate: date }
  });
  sku.quantity -= 1;
  await hotelSkuRepository.save(sku);
}
```

## 호텔 vs 일반 상품

| 구분 | 일반 상품 | 호텔 상품 |
|------|----------|----------|
| 재고 관리 | Sku (attributes) | HotelSku (날짜) |
| 옵션 가격 | 고정 가격 | 날짜별 가격 |
| 재고 차감 | 선택 SKU만 | 기간 내 모든 날짜 |
| 가격 계산 | 옵션 1회 | 날짜별 합산 |
