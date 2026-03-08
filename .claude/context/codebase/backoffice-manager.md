---
name: backoffice-manager
description: 백오피스 파트너 관리자 UI - 관리자 목록/추가/역할 변경/비밀번호 재설정/제거 공유 컴포넌트
keywords: [백오피스, 관리자, Manager, ManagerSection, 파트너, 역할, RoleType, 브랜드, 인플루언서]
estimated_tokens: ~300
---

# Backoffice Manager

백오피스에서 브랜드/인플루언서 파트너의 관리자(스태프)를 관리하는 공유 컴포넌트 모듈이다. `apps/backoffice/src/shared/components/manager/`에 위치하며, 브랜드/인플루언서 상세 페이지에서 공통으로 사용된다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/shared/components/manager/index.ts | 모듈 배럴 파일 | ManagerSection, useManagerSection export |
| apps/backoffice/src/shared/components/manager/ManagerSection.tsx | 관리자 섹션 UI (Card 래핑) | ManagerSection, ManagerSectionProps |
| apps/backoffice/src/shared/components/manager/ManagerTable.tsx | 관리자 목록 테이블 | ManagerTable, ManagerTableProps, PartnerManager |
| apps/backoffice/src/shared/components/manager/AddManagerModal.tsx | 관리자 추가 모달 (react-hook-form + zod) | AddManagerModal, AddManagerInput, ROLE_ENUM_VALUES |
| apps/backoffice/src/shared/components/manager/useManagerSection.ts | 관리자 관리 로직 훅 | useManagerSection() |

## 핵심 흐름

1. `useManagerSection({ partnerType, partnerId })` → 브랜드/인플루언서별 tRPC 쿼리로 관리자 목록 조회
2. `ManagerSection` → 관리자 추가 버튼 + `ManagerTable` 렌더링
3. 관리자 추가: `AddManagerModal` → react-hook-form + zod 검증 → tRPC mutation 호출
4. 역할 변경: `SelectDropdown`에서 `RoleType` 선택 → `onRoleChange(managerId, newRole: RoleType)` → tRPC mutation
5. 비밀번호 재설정/관리자 제거: 확인 다이얼로그 → tRPC mutation

## 보안 규칙

- `AddManagerModal`의 `ROLE_ENUM_VALUES`는 `PARTNER_SUPER`, `PARTNER_STAFF`만 허용 (ADMIN 역할 할당 불가)
- 역할 변경 시 `RoleType` 타입으로 제한하여 임의 문자열 전달 방지

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
