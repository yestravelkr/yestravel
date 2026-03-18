---
name: shop-payment
description: Shop 결제 처리 모듈 - PortOne PG 연동, 결제 승인/취소, TmpOrder->Order 변환, 호텔 재고 동시성 제어, 알림톡 발송
keywords: [결제, payment, portone, PG, 결제승인, 결제취소, shop, 주문생성, TmpOrder, 재고, HotelSku, 동시성, 알림톡, SMTNT, alimtalk]
estimated_tokens: ~700
---

# Shop Payment 모듈

Shop 프론트엔드의 결제 처리를 담당하는 NestJS 마이크로서비스 모듈이다. PortOne PG사 API와 연동하여 결제 승인 및 취소를 처리하고, TmpOrder(임시주문)를 정식 Order로 변환한다. 호텔 결제 완료 시 SMTNT를 통해 카카오 알림톡을 발송한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/shop/payment/shop.payment.module.ts | 모듈 정의 | ShopPaymentModule |
| apps/api/src/module/shop/payment/shop.payment.controller.ts | 메시지 핸들러 | ShopPaymentController.complete() |
| apps/api/src/module/shop/payment/shop.payment.service.ts | 결제 비즈니스 로직 | ShopPaymentService |
| apps/api/src/module/shop/payment/shop.payment.router.ts | tRPC 라우터 | - |
| apps/api/src/module/shop/payment/shop.payment.schema.ts | Zod 스키마 정의 | shopPaymentCompleteInputSchema, shopPaymentCompleteOutputSchema |
| apps/api/src/module/shop/payment/shop.payment.type.ts | 타입 정의 | ShopPaymentCompleteInput, ShopPaymentCompleteOutput |
| apps/api/src/module/shared/notification/smtnt/smtnt.service.ts | SMTNT 알림톡 발송 | SmtntService.sendAlimtalk() |
| apps/api/src/module/shared/notification/templates/SHOP_HOTEL_ORDER_PAID.txt | 호텔 결제 완료 알림톡 템플릿 | 카카오 알림톡 메시지 템플릿 |
| apps/api/src/module/shop/payment/shop.payment.service.integration.spec.ts | 결제 완료 통합 테스트 | BDD(GIVEN/WHEN/THEN) 스타일 테스트 4건 |
| apps/api/src/module/shop/payment/shop.payment.service.inventory.integration.spec.ts | 재고 동시성/복구 통합 테스트 | BDD 스타일 테스트 15건 |

## 핵심 흐름

### 결제 완료 처리

1. `ShopPaymentController.complete()` - MessagePattern `shopPayment.complete` 수신
2. `ShopPaymentService.handlePaymentComplete()` - paymentId에서 tmpOrderId 디코딩 (orderNumberParser.decode)
3. TmpOrder 조회 -> `createOrderFromTmpOrder()` 로 타입별 Order 생성 (HOTEL/DELIVERY/E-TICKET)
4. Order 저장 -> TmpOrder 삭제
5. `confirmPayment()` -> PortOne API로 결제 승인 -> `getPaymentDetail()` 로 상세 조회 -> `savePaymentSafely()` 로 Payment 엔티티 저장
6. 호텔 주문인 경우 `sendHotelOrderPaidAlimtalk()` -> SmtntService로 카카오 알림톡 발송 (실패 시 에러 로깅만, 결제 프로세스 미영향)

### 결제 취소

1. `ShopPaymentService.cancelPayment()` - paymentId(orderNumber), reason, amount 수신
2. PortOne API `/payments/{paymentId}/cancel` 호출 (전액 또는 부분 취소)

### PortOne 인증

- `generatePortoneAccessToken()` - API Secret 기반 토큰 발급, 20분 캐시

### 호텔 재고 차감 (deductHotelSkuQuantity)

1. 호텔 주문 생성 시 주문 날짜별 HotelSku를 `SELECT FOR UPDATE` (비관적 락)으로 조회
2. 각 SKU의 quantity를 1 차감 -> quantity < 0이면 에러
3. 재고 부족 시: PortOne 취소 API 호출 -> Order를 CANCELLED 상태로 전환 -> 트랜잭션 롤백으로 quantity 원복
4. 멀티 날짜 주문: 1개 날짜라도 재고 부족이면 전체 주문 실패 (all-or-nothing)

### 호텔 재고 복구 (restoreHotelSkuQuantity)

1. 주문 취소 시 `restoreHotelSkuQuantityFromOrder(order)` 호출 → order.type이 HOTEL인 경우만 처리
2. `orderOptionSnapshot.priceByDate`에서 날짜 목록 추출
3. 해당 날짜들의 HotelSku를 `SELECT FOR UPDATE` (비관적 락)으로 조회
4. 각 SKU의 quantity를 1 증가 → 저장
5. SKU 수와 날짜 수 불일치 시 logger.error로 경고 (트랜잭션은 계속 진행)

### 재고 복구 호출 경로 (3곳)

| 서비스 | 파일 | 취소 시나리오 |
|--------|------|-------------|
| ClaimService | apps/api/src/module/backoffice/claim/claim.service.ts | 백오피스 클레임 취소 |
| OrderService | apps/api/src/module/backoffice/order/order.service.ts | 백오피스 주문 환불 취소 |
| ShopClaimService | apps/api/src/module/shop/claim/shop.claim.service.ts | Shop 고객 클레임 취소 |

### 재고 관리 단위

- HotelSku는 `productId + date` 조합으로 재고를 관리한다
- 같은 숙소의 서로 다른 옵션은 동일 SKU를 공유한다
- 다른 날짜 또는 다른 숙소는 별도 SKU로 독립 관리된다

## 테스트 커버리지

| 카테고리 | 테스트 수 | 주요 검증 항목 |
|----------|----------|---------------|
| 결제 완료 정상 흐름 | 2건 | Order 생성(PAID), Payment 저장, TmpOrder 삭제 |
| 결제 완료 예외 | 2건 | 잘못된 paymentId, 존재하지 않는 TmpOrder, 멱등성(중복 호출 방지) |
| 재고 차감 기본 | 3건 | 정상 차감, 재고 0 차감 실패, 멀티 날짜 차감 |
| 재고 동시성 | 3건 | 재고 1에 2명 동시결제, 재고 2에 3명 동시결제, 실패 시 PortOne 취소/CANCELLED 상태 |
| 재고 엣지케이스 | 2건 | 취소 API 실패 에러 전파, 멀티 날짜 부분 재고 부족 시 전체 롤백 |
| 재고 공유 조건 | 4건 | 같은/다른 숙소+날짜+옵션 조합별 재고 공유/비공유 검증 |
| SKU 검증 | 1건 | 주문 날짜에 SKU 미존재 시 에러 |
| 재고 복구 기본 | 1건 | 차감된 재고(0)를 복구하여 1로 복원 |
| 재고 복구 멀티 날짜 | 1건 | 3일치 SKU 모두 quantity 1씩 복구 |
| 재고 복구 주문 연동 | 1건 | restoreHotelSkuQuantityFromOrder로 주문 기반 복구 |

### 호텔 결제 완료 알림톡 (sendHotelOrderPaidAlimtalk)

1. 결제 완료 후 주문 타입이 HOTEL인 경우에만 발송
2. SmtntService.sendAlimtalk()로 카카오 알림톡 발송 (templateCode: `SHOP_HOTEL_ORDER_PAID`)
3. 알림톡 발송 실패 시 LMS 대체 발송 (failedType: `LMS`)
4. 메시지 내용: 예약 안내, 주문 정보(주문번호/상품명/옵션/수량/날짜/금액), 예약 확인 링크, 고객센터, 변경/취소 안내
5. 발송 실패 시 에러 로깅만 수행하고 결제 프로세스에 영향을 주지 않음 (try-catch)

### 설정 참조

- `ConfigProvider.shopUrl`: Shop URL (기본값 `https://www.yestravel.co.kr`), 예약 확인 링크 생성에 사용
- CS_LINK: 고객센터 채널톡 URL

## 주요 설계 결정

- **TmpOrder -> Order 변환**: 결제 완료 시 임시주문을 정식 주문으로 변환하며, tmpOrder.id를 Order.id로 재사용하여 ID 연속성 보장
- **Payment 저장 안전성**: `savePaymentSafely()` 로 Payment 저장 실패 시에도 이미 승인된 결제를 롤백하지 않고 로깅만 수행 (수동 복구 가능)
- **타입별 Order 생성**: ProductTypeEnum에 따라 HotelOrderEntity.fromHotel() 또는 OrderEntity.from() 분기
- **TmpOrderEntity 직접 타입 참조**: 반환 타입 추론 대신 명시적 TmpOrderEntity 타입 사용으로 코드 명확성 향상
- **재고 동시성 제어**: DB 레벨 `SELECT FOR UPDATE` (비관적 락)으로 동시 결제 경합 처리. 재고 부족 시 PortOne 취소 후 트랜잭션 롤백
- **주문 취소 시 재고 복구**: 3개 취소 경로(ClaimService, OrderService, ShopClaimService) 모두에서 `restoreHotelSkuQuantityFromOrder()` 호출. wrapper 메서드가 order.type 체크 및 날짜 추출을 담당하여 중복 코드 제거

## 관련 엔티티

- OrderEntity, HotelOrderEntity: `apps/api/src/module/backoffice/domain/order/`
- HotelSkuEntity: `apps/api/src/module/backoffice/domain/product/hotel-sku.entity.ts`
- TmpOrderEntity: `apps/api/src/module/backoffice/domain/order/tmp-order.entity.ts`
- PaymentEntity: `apps/api/src/module/backoffice/domain/order/payment.entity.ts`
- orderNumberParser: `apps/api/src/module/backoffice/domain/order/order.entity.ts`

## 관련 Business Context

- [결제-주문 처리](../business/payment-processing.md)

## 관련 Domain Context

- [결제/주문 구조](../domain/payment-order.md)
