---
name: domain-payment-order
description: 결제/주문 시스템 구조. Order, Purchase, PurchaseLog, Snapshot 패턴.
keywords: [결제, 주문, Purchase, Order, PG, 환불, 취소, 스냅샷]
estimated_tokens: ~500
---

# 결제/주문 구조

## 핵심 컴포넌트

- **Order**: 주문 전체 관리
- **OrderOption**: 주문에 포함된 상품/옵션 (스냅샷)
- **Purchase**: PG사와의 개별 거래
- **PurchaseLog**: 결제 금액 변동 이력

## ERD

```
Product ─┬─ ProductOption (sku_selectors JSONB)
         └─ OrderOption (option_snapshot JSONB)
              │
Order ───────┴─ Purchase ── PurchaseLog
```

## 설계 원칙

### 1. Snapshot 패턴 (주문 시점 데이터 보존)

```
시나리오:
1. "오션뷰 (+30,000원)" 옵션으로 주문
2. OrderOption에 스냅샷: { name: "오션뷰", price: 30000 }
3. 관리자가 옵션 가격을 40,000원으로 인상
4. 기존 주문은 여전히 30,000원으로 표시됨
```

### 2. 다중 결제 (1 Order : N Purchase)

- **신규 결제**: 새 Purchase 생성
- **취소/환불**: 기존 Purchase의 PurchaseLog에 기록

```
Purchase #1 (최초 결제)
├─ PurchaseLog #1: +50,000 "결제 승인"
└─ PurchaseLog #2: -20,000 "부분 취소"

Purchase #2 (추가 결제)
└─ PurchaseLog #3: +10,000 "추가 옵션 결제"

→ 최종 금액: 50,000 - 20,000 + 10,000 = 40,000원
```

### 3. PurchaseLog 용도

- 주문 상세: 결제 히스토리 표시
- 고객 문의: 환불 처리 시점 확인
- 정산: PurchaseLog 합산으로 최종 금액 계산
- 감사: 모든 금액 변동 근거 확인

## SKU Selector 구조

```typescript
interface SkuSelectorConfig {
  selectableAttributes: Record<string, string[]>;
  quantity: number;  // 선택 시 SKU 수량
}

// 예시: 티셔츠 (색상 + 사이즈)
{
  "sku_selectors": [{
    "selectableAttributes": {
      "color": ["red", "blue"],
      "size": ["S", "M", "L"]
    },
    "quantity": 1
  }]
}

// 예시: 아이스크림 3개 골라담기
{
  "sku_selectors": [
    { "selectableAttributes": { "flavor": ["vanilla", "chocolate"] }, "quantity": 1 },
    { "selectableAttributes": { "flavor": ["vanilla", "chocolate"] }, "quantity": 1 },
    { "selectableAttributes": { "flavor": ["vanilla", "chocolate"] }, "quantity": 1 }
  ]
}
```

## 결제 상태

| 상태 | 설명 |
|------|------|
| PENDING | 결제 대기 |
| COMPLETED | 결제 완료 |
| FAILED | 결제 실패 |
| REFUNDED | 환불 완료 |
| PARTIALLY_REFUNDED | 부분 환불 |

## ProductTemplate과 SKU

SKU는 **ProductTemplate**에 연결되어 재고 공유 가능:

```
ProductTemplate: "티셔츠"
├─ Sku #1: color=Blue, size=L, stock=100
└─ Sku #2: color=Red, size=M, stock=50

Product #1: "봄 시즌 티셔츠" (campaign_id=1) → 위 SKU 사용
Product #2: "여름 세일 티셔츠" (campaign_id=2) → 동일 SKU 공유
```
