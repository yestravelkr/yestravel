---
name: backoffice-order
description: Backoffice 주문 관리 - 주문 조회/상태변경/엑셀 내보내기, Partner 데이터 스코핑
keywords: [주문, Order, backoffice, Partner, 스코핑, 필터, 엑셀, 상태변경]
estimated_tokens: ~400
---

# Backoffice Order

백오피스 주문 관리 모듈. 주문 목록 조회, 상태 변경, 엑셀 내보내기를 제공하며, Partner 인증 시 데이터 스코핑을 적용한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| order.router.ts | tRPC 라우터 - 입력 검증 및 마이크로서비스 전달 | OrderRouter, withPartnerScope() 호출 |
| order.controller.ts | NestJS 마이크로서비스 컨트롤러 | OrderController |
| order.service.ts | 주문 비즈니스 로직 | OrderService, applyPartnerScope(), verifyPartnerOwnership() |
| order.dto.ts | 입출력 타입 정의 (Zod 스키마 + PartnerScope) | FindAllOrdersInput, GetStatusCountsInput 등 |
| order.schema.ts | Zod 검증 스키마 | findAllOrdersInputSchema 등 |
| order-history.service.ts | 주문 이력 조회 | OrderHistoryService |

## 핵심 흐름

### 주문 목록 조회 (findAll)

1. tRPC Router → `withPartnerScope(ctx, input)` → 마이크로서비스 전달
2. Controller → Service.findAll()
3. Service: 검색/복합 필터 시 QueryBuilder, 단순 필터 시 TypeORM find 사용
4. Partner 스코핑: `applyPartnerScope(qb, partnerScope)` 로 WHERE 조건 자동 추가

### Partner 데이터 스코핑

1. Router에서 `withPartnerScope(ctx, input)` → ctx.admin에서 PartnerScope 추출 후 input에 주입
2. ADMIN: 스코핑 없이 전체 데이터 접근
3. BRAND: `product.brandId = partnerScope.brandId` 조건 → 자사 상품 주문만
4. INFLUENCER: `order.influencerId = partnerScope.influencerId` 조건 → 자신의 주문만
5. 단건 조회: `verifyPartnerOwnership()` 로 조회 결과의 소유권 검증

### 적용 범위

- findAll, getStatusCounts, getFilterOptions, findById, exportToExcel, getHistory 전체 엔드포인트

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
