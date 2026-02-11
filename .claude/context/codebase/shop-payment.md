---
name: shop-payment
description: Shop 결제 처리 모듈 - PortOne PG 연동, 결제 승인/취소, TmpOrder->Order 변환
keywords: [결제, payment, portone, PG, 결제승인, 결제취소, shop, 주문생성, TmpOrder]
estimated_tokens: ~400
---

# Shop Payment 모듈

Shop 프론트엔드의 결제 처리를 담당하는 NestJS 마이크로서비스 모듈이다. PortOne PG사 API와 연동하여 결제 승인 및 취소를 처리하고, TmpOrder(임시주문)를 정식 Order로 변환한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/shop/payment/shop.payment.module.ts | 모듈 정의 | ShopPaymentModule |
| apps/api/src/module/shop/payment/shop.payment.controller.ts | 메시지 핸들러 | ShopPaymentController.complete() |
| apps/api/src/module/shop/payment/shop.payment.service.ts | 결제 비즈니스 로직 | ShopPaymentService |
| apps/api/src/module/shop/payment/shop.payment.router.ts | tRPC 라우터 | - |
| apps/api/src/module/shop/payment/shop.payment.schema.ts | Zod 스키마 정의 | shopPaymentCompleteInputSchema, shopPaymentCompleteOutputSchema |
| apps/api/src/module/shop/payment/shop.payment.type.ts | 타입 정의 | ShopPaymentCompleteInput, ShopPaymentCompleteOutput |

## 핵심 흐름

### 결제 완료 처리

1. `ShopPaymentController.complete()` - MessagePattern `shopPayment.complete` 수신
2. `ShopPaymentService.handlePaymentComplete()` - paymentId에서 tmpOrderId 디코딩 (orderNumberParser.decode)
3. TmpOrder 조회 -> `createOrderFromTmpOrder()` 로 타입별 Order 생성 (HOTEL/DELIVERY/E-TICKET)
4. Order 저장 -> TmpOrder 삭제
5. `confirmPayment()` -> PortOne API로 결제 승인 -> `getPaymentDetail()` 로 상세 조회 -> `savePaymentSafely()` 로 Payment 엔티티 저장

### 결제 취소

1. `ShopPaymentService.cancelPayment()` - paymentId(orderNumber), reason, amount 수신
2. PortOne API `/payments/{paymentId}/cancel` 호출 (전액 또는 부분 취소)

### PortOne 인증

- `generatePortoneAccessToken()` - API Secret 기반 토큰 발급, 20분 캐시

## 주요 설계 결정

- **TmpOrder -> Order 변환**: 결제 완료 시 임시주문을 정식 주문으로 변환하며, tmpOrder.id를 Order.id로 재사용하여 ID 연속성 보장
- **Payment 저장 안전성**: `savePaymentSafely()` 로 Payment 저장 실패 시에도 이미 승인된 결제를 롤백하지 않고 로깅만 수행 (수동 복구 가능)
- **타입별 Order 생성**: ProductTypeEnum에 따라 HotelOrderEntity.fromHotel() 또는 OrderEntity.from() 분기
- **TmpOrderEntity 직접 타입 참조**: 반환 타입 추론 대신 명시적 TmpOrderEntity 타입 사용으로 코드 명확성 향상

## 관련 엔티티

- OrderEntity, HotelOrderEntity: `apps/api/src/module/backoffice/domain/order/`
- TmpOrderEntity: `apps/api/src/module/backoffice/domain/order/tmp-order.entity.ts`
- PaymentEntity: `apps/api/src/module/backoffice/domain/order/payment.entity.ts`
- orderNumberParser: `apps/api/src/module/backoffice/domain/order/order.entity.ts`

## 관련 Business Context

- [결제-주문 처리](../business/payment-processing.md)

## 관련 Domain Context

- [결제/주문 구조](../domain/payment-order.md)
