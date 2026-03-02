---
name: Order History
description: 주문 히스토리 모듈 - 주문 상태 변경/이벤트 감사 이력 기록 및 조회
keywords: [OrderHistory, 히스토리, 이력, 감사, 상태변경, 주문추적]
---

# Order History

주문의 상태 변경 및 비즈니스 이벤트를 시간순으로 기록하는 감사(audit) 모듈. 결제 완료, 상태 변경, 클레임 처리, 환불 등 주문 생명주기의 모든 주요 이벤트를 추적한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| domain/order/order-history.entity.ts | Entity 정의 | OrderHistoryEntity, getOrderHistoryRepository() |
| domain/order/order-history-action.ts | 액션 enum | OrderHistoryAction (14개 액션) |
| domain/order/order-history-metadata.type.ts | 메타데이터 타입 | OrderHistoryMetadata |
| order/order-history.module.ts | 모듈 정의 | OrderHistoryModule |
| order/order-history.service.ts | 이력 기록/조회 | OrderHistoryService.record(), findByOrderId() |
| order/order.router.ts | API 엔드포인트 | backofficeOrder.getHistory |
| order/order.schema.ts | Zod 스키마 | getHistoryInputSchema, orderHistoryItemSchema |
| order/order.dto.ts | DTO | GetHistoryInput |
| database/migration/1771911204021-CreateOrderHistoryTable.ts | 마이그레이션 | order_history 테이블 생성 |
| shared/transaction/repository.provider.ts | Repository 제공 | OrderHistoryRepository getter 추가 |

## Entity 구조

| 컬럼 | 타입 | 설명 |
|------|------|------|
| orderId | int (FK) | 주문 ID |
| previousStatus | varchar(30), nullable | 이전 상태 |
| newStatus | varchar(30) | 변경된 상태 |
| actorType | varchar(10) | SYSTEM / USER / ADMIN |
| actorId | int (FK), nullable | 관리자 ID |
| actorName | varchar(50), nullable | 액터 이름 |
| action | varchar(30) | OrderHistoryAction enum |
| description | text, nullable | UI 표시용 한국어 설명 |
| claimId | int (FK), nullable | 클레임 관련 액션 시 |
| optionId | int, nullable | 특정 옵션 관련 |
| optionName | varchar(100), nullable | 옵션 이름 |
| metadata | jsonb, nullable | OrderHistoryMetadata |

관계: Order(ManyToOne), Admin(ManyToOne), Claim(ManyToOne)
인덱스: order_id, action

## OrderHistoryAction 액션 목록

| 액션 | Actor | 발생 Service |
|------|-------|-------------|
| ORDER_CREATED | SYSTEM | ShopPaymentService |
| PAYMENT_COMPLETED | SYSTEM | ShopPaymentService |
| STATUS_CHANGED | ADMIN | OrderService |
| STATUS_REVERTED | ADMIN | OrderService |
| ADMIN_CANCELLED | ADMIN | OrderService |
| CANCEL_REQUESTED | USER | ShopClaimService |
| RETURN_REQUESTED | USER | ShopClaimService |
| CANCEL_WITHDRAWN | USER | ShopClaimService |
| CANCEL_AUTO_APPROVED | SYSTEM | ShopClaimService |
| CANCEL_APPROVED | ADMIN | ClaimService |
| CANCEL_REJECTED | ADMIN | ClaimService |
| RETURN_APPROVED | ADMIN | ClaimService |
| RETURN_REJECTED | ADMIN | ClaimService |
| REFUND_PROCESSED | SYSTEM/ADMIN | 여러 Service |

## 핵심 흐름

1. 결제 완료 시 → ShopPaymentService에서 ORDER_CREATED + PAYMENT_COMPLETED 기록
2. 관리자 상태 변경 시 → OrderService에서 STATUS_CHANGED / STATUS_REVERTED / ADMIN_CANCELLED 기록
3. 고객 클레임 요청 시 → ShopClaimService에서 CANCEL_REQUESTED / RETURN_REQUESTED 기록
4. 관리자 클레임 처리 시 → ClaimService에서 CANCEL_APPROVED / RETURN_APPROVED + REFUND_PROCESSED 기록
5. 백오피스에서 조회 시 → backofficeOrder.getHistory API로 시간순 이력 반환

## 모듈 의존성

OrderHistoryModule을 import하는 모듈: OrderModule, ClaimModule, ShopClaimModule, ShopPaymentModule

## Frontend

| 파일 | 역할 |
|------|------|
| shared/components/OrderHistoryModal.tsx | 이력 모달 UI (필터 칩 + 시간순 목록) |
| routes/_auth/order/hotel.$orderId.tsx | 호텔 주문 상세에서 모달 호출 |

openOrderHistoryModal() 함수형 호출 패턴 (react-snappy-modal 사용)

## 주요 설계 결정

1. **실패 허용(best-effort)**: record()는 try-catch로 감싸고 실패 시 null 반환. 이력 기록 실패가 비즈니스 로직에 영향 없음
2. **환불 이력 분리**: 취소 승인과 환불 처리를 별도 이력으로 분리 기록 (2건씩)
3. **Claim 이벤트도 기록**: 상태 변경 없이도 클레임 관련 이벤트 추적 (감사 목적)
4. **PurchaseLog와 역할 분리**: PurchaseLog는 금액 변동 이력(정산용), OrderHistory는 상태/이벤트 이력(감사/추적용)

## 관련 Business Context

- [결제 처리](../business/payment-processing.md)
- [주문 이력 추적](../business/order-tracking.md)
