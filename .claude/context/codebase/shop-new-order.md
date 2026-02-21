---
name: shop-new-order
description: Shop 프론트엔드 주문 생성 UI - 호텔 상품 결제 폼 섹션 컴포넌트 및 페이지
keywords: [shop, new-order, 주문생성, 결제폼, PortOne, 호텔예약, 프론트엔드, 컴포넌트]
estimated_tokens: ~400
---

# Shop New-Order 모듈

Shop 프론트엔드의 주문 생성(결제) 페이지를 구성하는 섹션 컴포넌트 모듈이다. React Hook Form 기반 폼으로 고객 정보 입력, 결제 수단 선택, 약관 동의를 처리하고 PortOne SDK를 통해 결제를 진행한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/shop/src/routes/_auth/new-order.$orderNumber.tsx | 주문 생성 페이지 (라우트) | NewOrderPage(), NewOrderContent(), NewOrderFormData, getPortOnePayMethod(), paymentComplete() |
| apps/shop/src/components/new-order/index.ts | 배럴 export | - |
| apps/shop/src/components/new-order/HotelProductSection.tsx | 호텔 상품 정보 표시 | HotelProductSection, HotelProductSectionProps |
| apps/shop/src/components/new-order/UserInputSection.tsx | 고객 이름/전화번호 입력 | UserInputSection() |
| apps/shop/src/components/new-order/PaymentMethodSection.tsx | 결제 수단 선택 | PaymentMethodSection(), PaymentType, PaymentMethod |
| apps/shop/src/components/new-order/PaymentAmountSection.tsx | 결제 금액 표시 | PaymentAmountSection, PaymentAmountSectionProps |
| apps/shop/src/components/new-order/PaymentAgreementSection.tsx | 약관 동의 및 결제 버튼 | PaymentAgreementSection, PaymentAgreementSectionProps |
| apps/shop/src/components/new-order/AuthPromptSection.tsx | 비인증 사용자 로그인 유도 | AuthPromptSection, AuthPromptSectionProps |

## 핵심 흐름

### 주문 결제 프로세스

1. `/_auth/new-order/$orderNumber` 라우트 진입 → tRPC `shopOrder.getTmpOrder`로 임시주문 조회
2. `FormProvider`로 `NewOrderFormData` 폼 상태 관리 (userName, userPhone, paymentType, paymentMethod)
3. 사용자 정보 입력 → 결제 수단 선택 → 약관 동의
4. 폼 제출 → tRPC `shopOrder.updateTmpOrder`로 고객 정보 저장
5. `@portone/browser-sdk/v2` 호출 → PG 결제 진행
6. 결제 성공 → `paymentComplete()` (axios)로 백엔드 결제 완료 처리
7. 주문 완료 페이지로 이동

### 라우트 구조

- 인증 필요 라우트 그룹(`_auth`) 하위에 위치
- 타입 import 경로: `@/routes/_auth/new-order.$orderNumber`

## 결제 수단

| 타입 | 수단 | 상태 |
|------|------|------|
| general | card (신용/체크카드) | 활성 |
| general | vbank (가상계좌) | 활성 |
| simple | kakaopay, naverpay, toss | 미구현 |
| general | bank (계좌이체) | 미구현 |

## 관련 Codebase Context

- [Shop Payment 백엔드](./shop-payment.md)

## 관련 Business Context

- [결제 처리](../business/payment-processing.md)
