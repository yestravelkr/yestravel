---
name: Backoffice Product
description: 백오피스 상품 관리 - 호텔/배송/E-티켓 상품 CRUD, 취소 수수료 정책, tRPC 라우터
keywords: [상품, Product, 호텔, Hotel, 취소수수료, CancellationFee, 백오피스, CRUD, tRPC]
---

# Backoffice Product

백오피스에서 상품(호텔, 배송, E-티켓)을 생성/조회/수정/삭제하는 모듈. 상품 타입별 discriminatedUnion 스키마로 입출력을 검증하며, 호텔 상품은 취소 수수료 정책과 SKU 관리를 포함한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| src/module/backoffice/domain/product/hotel-product.entity.ts | 호텔 상품 엔티티 | HotelProductEntity, CreateHotelProductInput, UpdateHotelProductInput |
| src/module/backoffice/product/product.router.ts | tRPC 라우터 (CRUD 엔드포인트) | findAll, findById, create, update, delete |
| src/module/backoffice/product/product.schema.ts | Zod 입출력 스키마 | hotelProductInputSchema, createProductInputSchema, updateProductInputSchema |
| src/module/backoffice/product/product.service.ts | 비즈니스 로직 | ProductService.findAll(), findById(), create(), update(), delete() |
| src/database/migration/1773138129971-add-cancellation-fees.ts | DB 마이그레이션 | product 테이블에 cancellation_fees JSONB 컬럼 추가 |
| packages/api-types/src/server.ts | 공유 tRPC 타입 | appRouter (프론트/백엔드 공용 타입) |

## 핵심 흐름

1. **상품 CRUD**: 클라이언트 → product.router.ts (Zod 검증) → product.service.ts → Entity → DB
2. **타입 분기**: discriminatedUnion으로 상품 타입(hotel/delivery/eticket)별 스키마 분리
3. **호텔 취소 수수료**: cancellationFees (JSONB) — `{ daysBeforeCheckIn: number, feePercentage: number }[]`
4. **SKU 관리**: saveHotelSkus()에서 비관적 락(pessimistic lock)으로 동시성 제어

## 취소 수수료 데이터 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| daysBeforeCheckIn | number (int, min 0) | 체크인 며칠 전 기준 |
| feePercentage | number (0-100) | 취소 수수료 비율(%) |

- Entity: `cancellationFees` JSONB 컬럼, 기본값 `[]`
- Schema: Zod `.array().default([])`로 검증
- Service: findById 시 nullable 필드에 기본값 `[]` 제공

## 관련 Business Context

- [호텔 취소 수수료](../business/hotel-cancellation-policy.md)
