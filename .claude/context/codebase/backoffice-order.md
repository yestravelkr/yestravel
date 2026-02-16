---
name: backoffice-order
description: 백오피스 주문 관리 모듈 - 주문 조회/상태 변경/되돌리기/취소/엑셀 내보내기
keywords: [backoffice, order, 주문관리, 상태변경, revertStatus, cancelOrder, exportExcel]
estimated_tokens: ~500
---

# Backoffice Order

백오피스에서 주문을 조회하고 상태를 관리하는 모듈. tRPC 라우터 + NestJS 서비스 구조로 주문 목록/상세 조회, 상태 전이, 상태 되돌리기, 어드민 취소, 엑셀 내보내기 기능을 제공한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/order/order.schema.ts | Zod validation 스키마 정의 (Input/Output) | orderStatusSchema, displayStatusSchema, updateStatusInputSchema, revertStatusInputSchema, cancelOrderInputSchema |
| apps/api/src/module/backoffice/order/order.service.ts | 주문 관리 비즈니스 로직 | findAll(), getStatusCounts(), getFilterOptions(), findById(), updateStatus(), revertStatus(), cancelOrder(), exportToExcel() |
| packages/api-types/src/server.ts | tRPC 자동생성 타입 (nestjs-trpc) | backoffice.order 라우터 타입 |

## 핵심 흐름

### 주문 목록 조회
1. `findAll(input)` → 필터/페이지네이션 적용 → claim 기반 displayStatus 합성 → 목록 반환

### 상태 변경
1. `updateStatus(input)` → `canTransition` 규칙 검증 → 상태 업데이트

### 상태 되돌리기
1. `revertStatus(input)` → HOTEL 상품만 지원 → revert map 기반 이전 상태 복원 → `{ success, orderId }` 반환

### 어드민 직접 취소
1. `cancelOrder(input)` → 포트원 환불 API 호출 → DB 상태 변경

### 엑셀 내보내기
1. `exportToExcel(input)` → 데이터 조회 → S3 업로드 → presigned URL 반환

## 주요 스키마

| 스키마 | 설명 |
|--------|------|
| orderStatusSchema | 주문 상태 enum (12개: PENDING ~ RETURNED) |
| displayStatusSchema | 표시용 합성 상태 (order status + claim 기반, CANCEL_REQUESTED/RETURN_REQUESTED 추가) |
| productTypeSchema | 상품 타입 (HOTEL, E-TICKET, DELIVERY) |

## 관련 Business Context

- [주문 상태 관리](../business/order-status-management.md)

## 관련 Domain Context

- [호텔 주문 구조](../domain/hotel-order.md)
- [결제/주문 구조](../domain/payment-order.md)
