---
name: Backoffice Navigation
description: 백오피스 사이드바 네비게이션 - 그룹별 메뉴 구조, 유저 정보, 로그아웃
keywords: [네비게이션, 사이드바, 메뉴, NavItem, NavGroup, 백오피스, navigation]
---

# Backoffice Navigation

백오피스 좌측 사이드바 네비게이션 컴포넌트. 그룹별 메뉴 구조, 유저 정보 표시, 로그아웃 기능을 제공한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/components/navigation/type.ts | 네비게이션 타입 정의 | NavGroup, NavItem, NavLink, NavCollapsible |
| apps/backoffice/src/components/navigation/data.tsx | 메뉴 데이터 정의 | NAV_GROUPS |
| apps/backoffice/src/components/navigation/nav-item.tsx | 개별 네비 아이템 컴포넌트 | NavItem() |
| apps/backoffice/src/components/navigation/navigation.tsx | 사이드바 메인 컴포넌트 | Navigation() |
| apps/backoffice/src/components/navigation/index.ts | 모듈 export | - |
| apps/backoffice/src/routes/_auth/route.tsx | 인증 레이아웃 (사이드바 + 메인) | RouteComponent() |

## 핵심 흐름

1. `_auth/route.tsx`에서 `Navigation` 컴포넌트를 좌측 사이드바로 렌더링
2. `Navigation`이 `NAV_GROUPS` 데이터를 순회하며 그룹별 메뉴 표시
3. 각 메뉴 아이템은 `NavItem` 컴포넌트로 렌더링 (TanStack Router `Link` 사용)
4. 상단에 유저 정보(이메일) + 로그아웃 버튼 표시 (`useAuthStore`)

## 메뉴 그룹 구조

| 그룹 | 메뉴 항목 | 경로 |
|------|----------|------|
| 상품관리 | 품목, 상품, 캠페인 | /product-template, /product, /campaign |
| 주문관리 | 주문목록, 정산 | /order/hotel, /settlement |
| 설정 | 브랜드, 인플루언서, 관리자 계정 | /brand, /influencer, /admin |

## 타입 구조

- `NavGroup`: title + items 배열
- `NavItem`: `NavLink` (단일 링크) | `NavCollapsible` (하위 메뉴 포함)
- `NavLink`: title + url + icon
- `NavCollapsible`: title + items 배열 + icon

## 스타일링

- tailwind-styled-components 사용
- 사이드바 너비: 280px, 흰색 배경, 우측 border
- 활성 메뉴: `[&.active]` 셀렉터로 배경색/아이콘 강조
- lucide-react 아이콘 사용

## 관련 Business Context

- [백오피스 관리](../business/backoffice-management.md)
