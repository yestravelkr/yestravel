---
name: additional-payment-plan
description: 주문 추가결제 기능 개발 계획
created: 2026-03-25
status: draft
---

# 주문 추가결제 기능 Plan

## 목적 (Why)

- **목적**: 기존 주문에 대해 추가 금액을 결제할 수 있는 기능 제공
- **문제**: 주문 확정 후 추가 비용이 발생하는 경우(옵션 변경, 추가 서비스, 가격 조정 등) 처리할 수단이 없음. 현재는 새 주문을 만들거나 수동 입금을 받아야 하는 비효율 존재
- **방법**: 관리자가 추가결제 링크를 발급 -> 사용자가 링크로 결제 -> 주문에 다건 결제 내역 반영

## 비즈니스 규칙

| 규칙 | 내용 | 비고 |
|------|------|------|
| 추가결제 횟수 | 한 주문당 **무제한** | |
| 링크 유효기간 | **24시간** (상수로 관리, 추후 일괄 변경 가능) | DB에는 만료일시(expiresAt)로 저장 |
| 발급 조건 | **정산 전**에만 가능 (influencerSettlementId, brandSettlementId가 null) | 정산 완료된 주문은 발급 불가 |
| 결제 수단 | 1차 결제와 **다른 수단 가능** | |
| 최소 금액 | **1,000원** | 최대 금액 제한 없음 |
| 미결제 링크 | 고려하지 않음 (만료 시 자동 소멸) | |
| 링크 취소 | 관리자가 발급한 링크를 **무효화 가능** | |
| 고객 주문 취소 | 추가결제 링크가 **발급된 상태**면 취소 불가 (결제 완료 여부 무관) | |
| 알림톡 | 이번 단계에서 **구현하지 않음** | 추후 별도 이슈 |

## 핵심 사용자 시나리오

### 시나리오 1: 관리자가 추가결제를 요청하는 경우

```
1. 고객이 호텔 예약 완료 (Order 생성됨)
2. 고객이 객실 업그레이드를 요청
3. 관리자가 백오피스에서 해당 주문 → "추가결제 링크 발급" 클릭
4. 추가결제 금액, 사유 입력
5. 링크 생성 → 고객에게 전달 (알림톡/카카오톡 등)
6. 고객이 링크 접속 → 결제 진행 → 완료
7. 주문 상세에서 [기존 결제 + 추가결제] 모두 확인 가능
```

### 시나리오 2: 고객이 결제 내역을 확인하는 경우

```
1. 고객이 주문 완료 페이지 또는 마이페이지 → 주문 상세 진입
2. 결제 내역 섹션에서 2건 이상의 결제 확인
   - 1차 결제: 150,000원 (호텔 예약)
   - 추가결제: 30,000원 (객실 업그레이드)
   - 총 결제 금액: 180,000원
```

## 필요한 기능 목록

### 1. 추가결제 링크 발급 (백오피스)

**왜 필요한가**: 추가 비용 발생 시 관리자가 고객에게 결제를 요청할 수 있는 유일한 수단

| 기능 | 설명 |
|------|------|
| 추가결제 생성 | 주문 상세에서 금액(최소 1,000원)/사유를 입력하여 추가결제 링크 생성 |
| 발급 조건 검증 | 정산 전(settlementId null)인 주문만 발급 가능 |
| 링크 관리 | 발급된 링크 상태 확인 (대기중/결제완료/만료/취소) |
| 링크 취소 | 관리자가 미결제 링크를 무효화 가능 |
| 링크 전달 | 생성된 링크 URL을 복사하여 고객에게 수동 전달 (알림톡 미연동) |

**설계 결정**:
- **선택:** 주문(Order) 단위로 추가결제를 연결
- **이유:** 고객 입장에서 하나의 주문에 대한 추가 비용이므로 주문 맥락 유지가 중요
- **차선책:** 별도 독립 결제로 처리
- **차선책 미채택 이유:** 고객이 어떤 주문의 추가비용인지 파악 불가, 관리 복잡도 증가

### 2. 추가결제 결제 페이지 (Shop)

**왜 필요한가**: 고객이 링크를 통해 추가 금액을 결제할 수 있는 페이지가 필요

| 기능 | 설명 |
|------|------|
| 결제 정보 표시 | 원래 주문 정보 + 추가결제 금액/사유 표시 |
| 결제 수단 선택 | 기존 결제 수단 활용 (PortOne) |
| 결제 완료 확인 | 결제 성공/실패 결과 화면 |

**설계 결정**:
- **선택:** 별도의 추가결제 전용 페이지
- **이유:** 기존 결제 플로우와 분리하여 추가결제만의 UX 제공 (금액/사유 명확 표시)
- **차선책:** 기존 결제 페이지 재활용
- **차선책 미채택 이유:** 기존 결제 플로우는 TmpOrder → Order 변환 로직이 포함되어 있어 추가결제에 맞지 않음

### 3. 다건 결제 내역 표시 (Shop)

**왜 필요한가**: 고객이 하나의 주문에서 여러 번 결제한 내역을 확인할 수 있어야 함

| 기능 | 설명 |
|------|------|
| 결제 내역 목록 | 1차 결제 + 추가결제를 리스트로 표시 |
| 총 결제 금액 | 모든 결제 합계 표시 |
| 각 결제 상세 | 개별 결제의 금액, 일시, 결제수단, 사유 표시 |

### 4. 추가결제 취소 제한 (Shop + 백오피스)

**왜 필요한가**: 추가결제는 관리자가 발급한 것이므로 취소도 관리자 통제 하에 이루어져야 함 (Issue #348)

| 기능 | 설명 |
|------|------|
| 고객 취소 차단 | 추가결제 링크가 **발급된 상태**면 고객 직접 취소 불가 (결제 완료 여부 무관) |
| CS 안내 | "취소는 고객센터에 문의해주세요" 안내 |
| 관리자 취소 | 백오피스에서 추가결제분/전체 선택 취소 가능 |

**설계 결정**:
- **선택:** 추가결제 링크 발급 시점부터 고객 직접 취소 전면 차단 (결제 완료 여부 무관)
- **이유:** 링크 발급 = 관리자가 추가 비용을 확정한 상태이므로, 고객이 원래 주문만 취소하면 추가결제 처리가 꼬임
- **차선책:** 추가결제 결제 완료 후에만 차단
- **차선책 미채택 이유:** 링크 발급 후 고객이 먼저 원래 주문을 취소하면 추가결제 링크가 무의미해지는 문제

### 5. 추가결제 알림 (이번 단계 미구현)

> 알림톡 연동은 이번 단계에서 구현하지 않음. 관리자가 링크 URL을 복사하여 수동 전달.

## DB 수정 계획

### 관계 구조

```
Order (1) → (N) Payment (1) → (0..1) AdditionalPayment
```

- 1차 결제 Payment → AdditionalPayment 없음
- 추가결제 Payment → AdditionalPayment 1:1 연결
- **OrderEntity에 additionalPayments 직접 관계 없음** → `order.payments.additionalPayment`로 join 접근

### AdditionalPaymentEntity (신규)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK auto increment | |
| created_at, updated_at | timestamp | |
| token | varchar(64), unique | UUID v4 (URL용) |
| title | varchar(200) | 결제 창에 표시할 제목 |
| amount | integer | 최소 1,000원 |
| reason | varchar(500) | 추가결제 사유 (관리자 메모) |
| expires_at | timestamp with time zone | 생성시각 + 24h |
| payment_id | integer, unique, nullable, FK → payment.id | 결제 완료 시 연결 (1:1) |
| deleted_at | timestamp with time zone, nullable | 관리자 무효화 (soft delete) |

**제거된 필드 (Payment에서 참조)**:
- ~~status~~ → Payment 상태를 따라감
- ~~paid_at~~ → `payment.paidAt`
- ~~order_id~~ → `payment.orderId`로 간접 참조

**상태 판단 로직 (computed, DB 컬럼 아님)**:

| 우선순위 | 조건 | 상태 |
|---------|------|------|
| 1 | deleted_at 존재 | DELETED (관리자 무효화, soft delete) |
| 2 | payment 존재 | Payment 상태를 따라감 (PAID 등) |
| 3 | expiresAt <= now | EXPIRED |
| 4 | 나머지 | PENDING |

### PaymentEntity 수정

- `@OneToOne(() => AdditionalPaymentEntity, ap => ap.payment)` 역방향 관계 추가
- 기존 컬럼/로직 변경 없음

**설계 결정**:
- **선택:** AdditionalPayment는 Payment와 1:1, status는 Payment 상태를 따라감
- **이유:** 결제 상태의 단일 진실점(SSOT)을 Payment에 두어 상태 불일치 방지. AdditionalPayment는 "요청 메타데이터"(token, title, reason, expiresAt)만 관리
- **차선책:** AdditionalPayment에 자체 status 컬럼을 두고 Payment와 별도 관리
- **차선책 미채택 이유:** 두 곳에서 상태를 관리하면 동기화 이슈 발생 가능

## API 구성

### Backoffice API (`backofficeAdditionalPayment`)

| Method | Endpoint | 설명 | Input | Output |
|--------|----------|------|-------|--------|
| Mutation | `create` | 추가결제 링크 생성 | orderId, amount(min 1000), title, reason | additionalPaymentId, token, paymentUrl, expiresAt |
| Query | `findByOrderId` | 주문별 추가결제 목록 | orderId | AdditionalPayment[] |
| Mutation | `cancel` | 링크 무효화 | additionalPaymentId | success |

### Shop API (`shopAdditionalPayment`)

| Method | Endpoint | 설명 | Input | Output |
|--------|----------|------|-------|--------|
| Query | `getByToken` | 토큰으로 추가결제 정보 조회 | token | 추가결제 정보 + 주문정보 |
| Mutation | `complete` | 추가결제 결제 승인 | token, paymentId, paymentToken, txId | success, orderNumber |

**설계 결정**:
- **선택:** 추가결제 전용 모듈 분리 (backoffice/additional-payment, shop/additional-payment)
- **이유:** 기존 패턴(order, payment, claim 각 분리)과 일치, OrderService(850줄+) 비대화 방지
- **차선책:** 기존 OrderService에 메서드 추가
- **차선책 미채택 이유:** SRP 위반, 서비스 비대화

**인증**:
- **선택:** 추가결제 결제 페이지는 **인증 불필요** (토큰이 인증 역할)
- **이유:** 고객이 로그인 없이 문자/카카오톡 링크로 결제해야 함
- **차선책:** ShopAuthMiddleware 적용
- **차선책 미채택 이유:** 비로그인 고객의 결제 시나리오 지원 불가

**paymentId 인코딩**: `{ENV_PREFIX}ADDPAY{YYMMDD}-{sqids([orderId, additionalPaymentId])}`

### 기존 코드 수정

| 파일 | 변경 |
|------|------|
| `payment.entity.ts` | `@OneToOne(() => AdditionalPaymentEntity)` 역방향 관계 추가 |
| `shop.claim.service.ts` | 취소 시 추가결제 존재 여부 가드 (`payment.additionalPayment` join) |
| `shop.order.service.ts` | getOrderDetail에 `hasActiveAdditionalPayment` 필드 |
| `order-history-action.ts` | ADDITIONAL_PAYMENT_REQUESTED/COMPLETED/CANCELLED |

## FE 페이지 Flow

### Backoffice - 주문 상세

```
[기존 주문 상세 페이지]
  └── PaymentInfoCard (기존)
  └── AdditionalPaymentCard (신규)
        ├── "추가결제 발급" 버튼 → 모달 (금액, title, 사유 입력)
        ├── 추가결제 목록 (상태 뱃지, 금액, 사유, 만료일시)
        ├── 각 항목: 링크 복사 버튼
        └── PENDING 항목: 무효화 버튼
```

### Shop - 추가결제 결제 페이지 (신규)

```
/additional-payment/{token} (인증 불필요, _auth 바깥)
  ├── title 표시, 추가결제 금액, 사유 표시
  ├── PENDING → 결제 버튼 (PortOne.requestPayment)
  ├── PAID → "이미 결제 완료" 안내
  ├── CANCELLED → "무효화된 링크" 안내
  └── EXPIRED → "만료된 링크" 안내
```

### Shop - 주문 상세 변경

```
PaymentSummarySection 수정:
  ├── 1차 결제: {금액} ({결제수단})
  ├── 추가결제 1: {금액} ({사유})
  ├── 추가결제 2: {금액} ({사유})
  └── 총 결제 금액: {합계}

취소 버튼:
  ├── hasActiveAdditionalPayment === true → 비활성화 + CS 안내
  └── false → 기존 취소 플로우
```

## 설계 결정 요약

| 영역 | 결정 | 이유 | 차선책 |
|------|------|------|--------|
| Entity 관계 | Order→Payment→AdditionalPayment (1:1) | Payment 상태를 SSOT로 활용 | Order→AdditionalPayment 직접 관계 |
| status | Payment 상태를 따라감 (자체 status 없음) | 상태 불일치 방지 | 자체 status 컬럼 |
| 모듈 | 전용 모듈 분리 | SRP, 기존 패턴 일치 | OrderService에 추가 |
| 인증 | 토큰 기반, 인증 불필요 | 비로그인 결제 지원 | ShopAuthMiddleware |
| 취소 정책 | 링크 발급 시점부터 차단 | 링크 발급 = 추가 비용 확정 | 결제 완료 후에만 차단 |
| paymentId | ADDPAY prefix + Sqids | 기존 패턴 일관성, 중복 방지 | 문자열 조합 |
| 유효기간 | 24시간 (상수) | 추후 일괄 변경 용이 | DB 설정값 |
| 발급 조건 | 정산 전에만 | 정산 후 금액 변경 불가 | 상태 무관 |

## TaskList 요약

| Task | 설명 | 의존성 |
|------|------|--------|
| T1 | DB - AdditionalPaymentEntity + 마이그레이션 + RepositoryProvider | - |
| T2 | Backoffice API - create, findByOrderId, cancel | T1 |
| T3 | Shop API - getByToken, complete + paymentId 인코딩 | T1 |
| T4 | 취소 차단 가드 - ShopClaimService | T1 |
| T5 | Shop Order API 수정 - hasActiveAdditionalPayment, 다건 결제 | T1 |
| T6 | Backoffice FE - AdditionalPaymentCard + 주문 상세 통합 | T2 |
| T7 | Shop FE - 추가결제 결제 페이지 | T3 |
| T8 | Shop FE - 주문 상세 수정 (취소 비활성화 + 다건 표시) | T4, T5 |
