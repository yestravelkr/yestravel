---
name: admin-shared
description: Backoffice/Partner 앱 간 공유 컴포넌트 패키지 - 주문 관리 모달, 스타일, Provider
keywords: [admin-shared, 공유컴포넌트, AdminSharedProvider, 모달, 주문취소, CancelOrderModal, CancelApproveModal]
estimated_tokens: ~400
---

# Admin Shared

backoffice와 partner 앱에서 공통으로 사용하는 UI 컴포넌트, 훅, Provider를 제공하는 패키지이다. `packages/admin-shared`에 위치하며, `@yestravelkr/admin-shared`로 import한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| packages/admin-shared/src/index.ts | Barrel export (providers, types, constants, utils, components) | 패키지 진입점 |
| packages/admin-shared/src/components/modals/CancelOrderModal.tsx | 주문 취소 요청 모달 - 취소 사유 선택, 환불 금액 입력 | CancelOrderModal, openCancelOrderModal() |
| packages/admin-shared/src/components/modals/CancelApproveModal.tsx | 취소 승인 모달 - 환불 금액 확인 및 승인 | CancelApproveModal, openCancelApproveModal() |
| packages/admin-shared/src/components/modals/shared-styles.ts | 모달 공통 tailwind styled components (22개) | Container, Header, Title, InputSection, SummaryBox 등 |

## 핵심 흐름

### 모달 호출 패턴

1. `openCancelOrderModal()` / `openCancelApproveModal()` 함수 호출 → react-snappy-modal로 모달 표시
2. 모달 내부에서 사유/금액 입력 → 확인 다이얼로그 → 콜백 실행
3. 공통 스타일은 `shared-styles.ts`에서 import하여 중복 제거

### 공유 아키텍처

1. `AdminSharedProvider`로 tRPC 클라이언트 등 공통 의존성 주입
2. backoffice/partner 양쪽에서 동일한 컴포넌트를 import하여 UI 일관성 유지

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
- [결제 처리](../business/payment-processing.md)
