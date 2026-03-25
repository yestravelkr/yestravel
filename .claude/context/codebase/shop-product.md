---
name: Shop Product
description: Shop 상품 상세 페이지 탭 네비게이션(상품정보/판매정보/다른 상품 보기), 상품 타입별 분기 렌더링
keywords: [shop, product, 상품상세, 탭, 판매정보, 다른상품, 호텔, SalesInfo, OtherProducts]
---

# Shop Product

Shop 앱의 상품 상세 페이지 모듈. `/sale/{saleId}` 라우트에서 상품 타입별(HOTEL/E-TICKET/DELIVERY) 분기 렌더링하며, 탭 네비게이션으로 상품정보/판매정보/다른 상품 보기를 전환한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/shop/src/routes/sale.$saleId.tsx | 상품 상세 라우트 | Route, SaleDetailPage() |
| apps/shop/src/components/product/HotelProductComponent.tsx | 호텔 상품 메인 컴포넌트 | HotelProductComponent, HotelProductComponentProps |
| apps/shop/src/components/product/ProductDetailTabs.tsx | 탭 UI 컴포넌트 | ProductDetailTabs, ProductDetailTab 타입 |
| apps/shop/src/components/product/SalesInfoContent.tsx | 판매정보 탭 콘텐츠 | SalesInfoContent, SellerInfo, AccommodationInfo |
| apps/shop/src/components/product/OtherProductsContent.tsx | 다른 상품 보기 탭 콘텐츠 | OtherProductsContent, OtherProductsContentProps |

## 핵심 흐름

1. `sale.$saleId.tsx`에서 `shopProduct.getProductDetail` tRPC 쿼리로 상품 데이터 조회
2. 상품 타입별 분기: HOTEL -> `HotelProductComponent`, E-TICKET/DELIVERY -> 별도 컴포넌트
3. `HotelProductComponent`에서 `ProductDetailTabs`로 탭 전환 (info/sale/recommend)
4. 판매정보 탭: `SalesInfoContent` (문의하기 CTA + 판매자 사업자 정보 아코디언)
5. 다른 상품 보기 탭: `OtherProductsContent` (`shopInfluencer.getCampaignDetail` API로 같은 캠페인 내 다른 상품 조회)

## 주요 패턴

| 패턴 | 설명 |
|------|------|
| Suspense + useSuspenseQuery | tRPC Suspense 쿼리 (Suspense 래퍼 + Inner 컴포넌트 분리) |
| tailwind-styled-components | `tw` 태그드 템플릿으로 styled component 정의 |
| 조건부 props 스타일링 | `$selected` prop으로 탭 활성 스타일 전환 |

## 관련 Business Context

- [상품 탐색](../business/product-browsing.md)
