---
name: Backoffice Admin
description: 백오피스 관리자 계정 관리 - CRUD, 권한(Role) 체계, JWT 기반 권한 판별
keywords: [admin, 관리자, backoffice, role, 권한, JWT, CRUD]
---

# Backoffice Admin

백오피스 관리자 계정의 목록 조회, 생성, 상세 보기, 비밀번호 재설정, 삭제 기능을 제공한다. JWT 토큰 기반으로 슈퍼 관리자 여부를 판별하여 권한별 UI를 분기한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/routes/_auth/admin/index.tsx | 관리자 목록 페이지 | AdminListPage() |
| apps/backoffice/src/routes/_auth/admin/_components/AdminList.tsx | 관리자 테이블 + 권한 판별 + 검색 필터링 | AdminList(), getRoleFromToken() |
| apps/backoffice/src/routes/_auth/admin/_components/ResetPasswordModal.tsx | 비밀번호 재설정 모달 | openResetPasswordModal() |
| apps/backoffice/src/routes/_auth/admin/$adminId.tsx | 관리자 상세/수정 페이지 | - |
| apps/backoffice/src/routes/_auth/admin/create.tsx | 관리자 생성 페이지 | - |
| apps/backoffice/src/constants/role.ts | 역할 상수 및 레이블 정의 | ROLE_VALUES, ROLE_LABELS, RoleType |

## 핵심 흐름

1. AdminListPage → `backofficeAdmin.findAll` tRPC 쿼리로 관리자 목록 조회
2. `getRoleFromToken(accessToken)` → JWT 페이로드에서 role 추출하여 슈퍼 관리자 여부 판별
3. 슈퍼 관리자인 경우 → 비밀번호 재설정, 관리자 삭제 액션 메뉴 노출
4. 검색어 입력 시 → 이름/이메일/연락처 기준 클라이언트 필터링
5. 검색 결과 없음 → EmptyState 분기 (검색 결과 없음 vs 관리자 없음)

## 권한(Role) 체계

| 역할 값 | 레이블 | 배지 스타일 |
|---------|--------|------------|
| ADMIN_SUPER | 최고 관리자 | purple |
| ADMIN_STAFF | 관리자 | blue |
| PARTNER_SUPER | 대표 관리자 | green |
| PARTNER_STAFF | 관리자 | gray |

## tRPC 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| backofficeAdmin.findAll | 전체 관리자 목록 조회 |
| backofficeAdmin.updatePassword | 비밀번호 변경 |
| backofficeAdmin.delete | 관리자 삭제 |

## 관련 Business Context

- [파트너 관리](../business/partner-management.md)
