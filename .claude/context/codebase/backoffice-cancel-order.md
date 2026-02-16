---
name: backoffice-cancel-order
description: 백오피스 주문 취소 모달 및 호텔 주문 상세 페이지 취소 연동
keywords: [cancel, order, modal, backoffice, hotel, refund, claim, 취소, 환불]
---

# Backoffice Cancel Order

백오피스에서 판매자가 직접 주문을 취소할 수 있는 모달 컴포넌트와 호텔 주문 상세 페이지 연동.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/shared/components/CancelOrderModal.tsx | 주문 취소 모달 UI + 확인 다이얼로그 | CancelOrderModal(), openCancelOrderModal(), openCancelOrderConfirmDialog(), CancelOrderConfirmDialog() |
| apps/backoffice/src/routes/_auth/order/hotel.$orderId.tsx | 호텔 주문 상세 페이지 | HotelOrderDetailPage(), handleCancelOrder() |
| apps/backoffice/src/shared/components/index.ts | 공유 컴포넌트 re-export barrel | export * from './CancelOrderModal' |

## 핵심 흐름

1. 호텔 주문 상세 페이지에서 `handleCancelOrder()` 호출 → `openCancelOrderModal()` 실행
2. CancelOrderModal에서 취소 수수료 입력, 취소 사유 선택 (고객요청/재고부족/가격오류/직접입력)
3. 환불금액 자동 계산 (상품금액 - 취소 수수료)
4. "주문취소" 클릭 → `openCancelOrderConfirmDialog()` 최종 확인 다이얼로그 표시
5. 확인 시 `CancelOrderResult` 반환 → `backofficeOrder.cancelOrder` tRPC mutation 호출

## 주요 인터페이스

- `CancelOrderModalProps`: productAmount(상품금액), defaultCancelFee(기본수수료)
- `CancelOrderResult`: confirmed, cancelFee, refundAmount, reason
- 취소 사유 옵션: CUSTOMER_REQUEST, NO_AVAILABILITY, PRICE_ERROR, CUSTOM

## 관련 tRPC 엔드포인트

- `backofficeOrder.cancelOrder`: orderId, reason, refundAmount 전달
- `backofficeOrder.findById`: 주문 상세 조회
- `backofficeClaim.findByOrderId`: 클레임 이력 조회

## 관련 Business Context

- [주문 관리](../business/order-management.md)
