---
name: Backoffice Product
description: 백오피스 숙박 상품 생성/수정 - 폼 구조, 취소 수수료 카드, 상품 템플릿 연동
keywords: [백오피스, 상품, 호텔, 생성, 수정, 취소수수료, CancellationFee, ProductForm]
---

# Backoffice Product

백오피스에서 숙박(호텔) 상품을 생성하고 수정하는 UI 모듈이다. React Hook Form 기반 폼 구조로, 기본 정보/옵션/가격/취소 수수료 등을 관리한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/routes/_auth/product/hotel.create.tsx | 호텔 상품 생성 페이지 | createProductMutation, handleImportProduct() |
| apps/backoffice/src/routes/_auth/product/hotel.$productId.edit.tsx | 호텔 상품 수정 페이지 | updateProductMutation, useEffect(product 로드) |
| apps/backoffice/src/routes/_auth/product/_components/create/ProductForm.tsx | 상품 폼 공유 컴포넌트 | ProductFormProps, ProductFormData |
| apps/backoffice/src/routes/_auth/product/_components/create/CancellationFeeCard.tsx | 취소 수수료 카드 UI | handleAdd(), handleRemove(), handleUpdate() |

## 핵심 흐름

1. **상품 생성**: hotel.create.tsx → ProductForm → tRPC `backofficeProduct.create` 뮤테이션
2. **상품 수정**: hotel.$productId.edit.tsx → 기존 데이터 로드(`backofficeProduct.findById`) → ProductForm → tRPC `backofficeProduct.update` 뮤테이션
3. **템플릿 가져오기**: hotel.create.tsx에서 `LoadProductTemplateModal`로 템플릿 선택 → `setValue`로 폼 필드 자동 채움

## ProductForm 구성 카드

| 카드 컴포넌트 | 역할 |
|--------------|------|
| BasicInfoCard | 상품명, 설명, 브랜드 등 기본 정보 |
| ProductTemplateAssociationCard | 상품 템플릿 연결 |
| ProductTemplateDetailInfoCard | 템플릿 상세 정보 |
| ProductOptionsPricingCard | 옵션 및 가격 설정 |
| CancellationFeeCard | 취소 수수료 정책 (체크인 N일 전, 수수료 %) |
| ProductTemplateDetailPageCard | 상세 페이지 설정 |

## ProductFormData 주요 필드

- `name`, `description`, `brandId` - 기본 정보
- `capacity`, `checkInTime`, `checkOutTime` - 숙박 정보
- `hotelOptions`, `hotelSkus` - 옵션/가격
- `cancellationFees: { daysBeforeCheckIn: number, feePercentage: number }[]` - 취소 수수료 정책

## 관련 Business Context

- [상품 관리](../business/product-management.md)
