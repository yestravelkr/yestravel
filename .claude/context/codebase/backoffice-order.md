---
name: backoffice-order
description: Backoffice 주문 관리 모듈 - 주문 조회/상태관리/취소/엑셀 내보내기
keywords: [주문, order, backoffice, 주문관리, 주문취소, cancelOrder, 주문상태, 환불, refund]
estimated_tokens: ~400
---

# Backoffice Order 모듈

백오피스 관리자용 주문 관리 NestJS 마이크로서비스 모듈이다. 주문 목록 조회, 상태 변경, 주문 취소(환불), 엑셀 내보내기 기능을 제공한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/order/order.module.ts | 모듈 정의 | OrderModule |
| apps/api/src/module/backoffice/order/order.controller.ts | 메시지 핸들러 | OrderController |
| apps/api/src/module/backoffice/order/order.service.ts | 비즈니스 로직 | OrderService |
| apps/api/src/module/backoffice/order/order.router.ts | tRPC 라우터 | - |
| apps/api/src/module/backoffice/order/order.schema.ts | Zod 스키마 정의 | cancelOrderInputSchema, cancelOrderOutputSchema 등 |
| apps/api/src/module/backoffice/order/order.dto.ts | 타입 정의 | Zod 스키마 기반 DTO |
| packages/api-types/src/server.ts | tRPC 타입 공유 | cancelOrder 라우터 정의 포함 |

## 핵심 흐름

### 주문 목록/상세

1. `OrderService.findAll()` - 필터링, 페이지네이션 기반 주문 목록 조회
2. `OrderService.findById()` - 단일 주문 상세 조회
3. `OrderService.getStatusCounts()` - 상태별 주문 수 집계
4. `OrderService.getFilterOptions()` - 필터 옵션 값 조회

### 주문 취소 (cancelOrder)

1. `OrderService.cancelOrder()` - orderId, reason, refundAmount 입력
2. 주문 존재 여부 및 이미 취소 상태인지 검증
3. Payment 엔티티 조회
4. `ShopPaymentService.cancelPayment()` 호출 - PortOne API로 환불 요청
5. Order 상태를 CANCELLED로 변경, Payment.nowAmount 업데이트
6. 응답: success, orderId, refundAmount

### 엑셀 내보내기

1. `OrderService.exportToExcel()` - 필터 조건 기반 주문 데이터 엑셀 변환

## 주요 설계 결정

- **refundAmount 직접 지정**: 관리자가 환불 금액을 직접 입력 (수수료 차감 계산 대신 명시적 금액 전달)
- **@Transactional**: cancelOrder는 트랜잭션 내에서 실행되나, PortOne API 호출 성공 후 DB 저장 실패 시 PG 환불은 롤백되지 않음 (결제 안정성 우선)

## 관련 엔티티

- OrderEntity: `apps/api/src/module/backoffice/domain/order/order.entity.ts`
- PaymentEntity: `apps/api/src/module/backoffice/domain/order/payment.entity.ts`

## 관련 Business Context

- [결제 처리](../business/payment-processing.md)

## 관련 Codebase Context

- [Shop Payment](./shop-payment.md) - ShopPaymentService.cancelPayment() 호출
