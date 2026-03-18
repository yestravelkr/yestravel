---
name: admin-shared
description: Backoffice/Partner 공유 UI 패키지 - 주문 관리 컴포넌트, 기본 UI, 타입, 상수, 유틸, Context Provider
keywords: [admin-shared, 주문, 공유, 컴포넌트, OrderCapabilities, backoffice, partner]
estimated_tokens: ~500
---

# Admin Shared

backoffice와 partner 앱에서 공통으로 사용하는 주문 관리 UI 패키지이다. `packages/admin-shared`에 위치하며, Capabilities 패턴으로 앱별 권한을 제어한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| packages/admin-shared/src/index.ts | 루트 배럴 export | 전체 모듈 re-export |
| src/providers/AdminSharedContext.tsx | tRPC 클라이언트 Context Provider | AdminSharedProvider, useAdminTrpc |
| src/types/order.types.ts | 주문 관련 tRPC 타입 | OrderFilterInput, OrderListItem, OrderDetail, OrderCapabilities, PARTNER_CAPABILITIES, BACKOFFICE_CAPABILITIES |
| src/constants/order-status.ts | 주문 상태 정의 | OrderBaseStatus, OrderDisplayStatus, ORDER_STATUS_LABELS, STATUS_ACTION_CONFIG |
| src/utils/format.ts | 가격 포맷팅 | formatPrice, formatPriceRaw |

### 도메인 컴포넌트

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| src/components/OrderStatusCard.tsx | 주문 상태 카드 | OrderStatusCard |
| src/components/OrderDetailHeader.tsx | 주문 상세 헤더 | OrderDetailHeader |
| src/components/PaymentInfoCard.tsx | 결제 정보 카드 | PaymentInfoCard |
| src/components/MemberInfoCard.tsx | 회원 정보 카드 | MemberInfoCard |
| src/components/OrderFilters.tsx | 주문 필터 컨트롤 | OrderFilters, OrderFiltersState |

### 기본 UI 컴포넌트

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| src/components/base/Card.tsx | 카드 래퍼 | Card |
| src/components/base/Table.tsx | 데이터 테이블 | Table |
| src/components/base/Pagination.tsx | 페이지네이션 | Pagination |
| src/components/base/StatusTabs.tsx | 상태 탭 필터 | StatusTabs |
| src/components/base/CascadingPeriodFilter.tsx | 기간 필터 프리셋 | CascadingPeriodFilter |
| src/components/base/ConfirmModal.tsx | 확인 다이얼로그 | ConfirmModal, openConfirmModal |
| src/components/base/SearchableSelect.tsx | 검색 가능 셀렉트 | SearchableSelect |
| src/components/base/MultiSelectDropdown.tsx | 다중 선택 드롭다운 | MultiSelectDropdown |

### 모달 컴포넌트

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| src/components/modals/CancelApproveModal.tsx | 취소 승인 모달 | CancelApproveModal, openCancelApproveModal |
| src/components/modals/CancelOrderModal.tsx | 주문 취소 모달 | CancelOrderModal, openCancelOrderModal |
| src/components/modals/OrderHistoryModal.tsx | 주문 이력 모달 | OrderHistoryModal, openOrderHistoryModal |

## 핵심 흐름

### Capabilities 패턴

1. `OrderCapabilities` 인터페이스가 앱별 권한(취소, 승인, 이력 조회 등)을 정의
2. `BACKOFFICE_CAPABILITIES` → 전체 권한 (취소, 승인, 확정, 이력 등)
3. `PARTNER_CAPABILITIES` → 제한된 권한 (읽기 + 일부 액션만)
4. 각 컴포넌트에 capabilities를 주입하여 UI 동적 제어

### AdminSharedProvider

1. 앱(backoffice/partner)에서 `AdminSharedProvider`로 tRPC 클라이언트 주입
2. 공유 컴포넌트가 `useAdminTrpc()`로 tRPC 호출 → 앱별 다른 클라이언트 사용

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
- [결제 처리](../business/payment-processing.md)
