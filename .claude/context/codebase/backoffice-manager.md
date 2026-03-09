---
name: backoffice-manager
description: 백오피스 파트너 관리자 관리 - CRUD, 역할 변경, 비밀번호 재설정 (TanStack Table + React Hook Form)
keywords: [백오피스, 관리자, 매니저, Manager, ManagerSection, RoleType, 파트너관리자]
estimated_tokens: ~300
---

# Backoffice Manager
백오피스에서 파트너(브랜드/인플루언서)의 관리자를 추가, 조회, 역할 변경, 비밀번호 재설정, 제거하는 컴포넌트 모듈이다. `apps/backoffice/src/shared/components/manager/`에 위치한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/shared/components/manager/index.ts | 공개 export 정의 | - |
| apps/backoffice/src/shared/components/manager/ManagerSection.tsx | Card 래핑 관리자 섹션 UI | ManagerSection(), ManagerSectionProps |
| apps/backoffice/src/shared/components/manager/ManagerTable.tsx | TanStack Table 기반 관리자 목록 | ManagerTable(), PartnerManager, roleOptions |
| apps/backoffice/src/shared/components/manager/useManagerSection.ts | 관리자 CRUD 로직 훅 | useManagerSection() |
| apps/backoffice/src/shared/components/manager/AddManagerModal.tsx | 관리자 추가 모달 | AddManagerModal(), openAddManagerModal() |
| apps/backoffice/src/constants/role.ts | 역할 타입/라벨 정의 | RoleType, ROLE_VALUES, ROLE_LABELS |

## 핵심 흐름

1. `useManagerSection({ partnerType, partnerId })` → Brand/Influencer API 분기하여 관리자 목록 조회
2. `ManagerSection` → 테이블 렌더링 + "관리자 추가" 버튼
3. 역할 변경 시 `onRoleChange(managerId, newRole: RoleType)` → updateManagerRole Mutation 호출
4. 관리자 추가 시 `openAddManagerModal()` → AddManagerInput(email, password, name, phoneNumber, role) 수집 → createManager Mutation 호출

## 타입 정보

- `RoleType`: `'ADMIN_SUPER' | 'ADMIN_STAFF' | 'PARTNER_SUPER' | 'PARTNER_STAFF'`
- 파트너 관리자 역할은 `PARTNER_SUPER`(대표 관리자), `PARTNER_STAFF`(관리자)만 사용


## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
