---
name: backoffice-layout
description: 백오피스 공통 레이아웃 컴포넌트 - FormPageLayout, DetailPageLayout, ListPageLayout 등 Compound Component 패턴
keywords: [백오피스, 레이아웃, FormPageLayout, DetailPageLayout, ListPageLayout, Compound Component, tailwind-styled-components]
---

# Backoffice Layout Components

백오피스 앱의 공통 페이지 레이아웃 컴포넌트들이다. Compound Component 패턴으로 구성되며, `tailwind-styled-components`로 스타일링한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/shared/components/layout/FormPageLayout.tsx | 폼 기반 상세 페이지 레이아웃 (1컬럼 중앙 정렬) | FormPageLayout.Container, FormPageLayout.Content, FormPageLayout.Header, FormPageLayout.Cards, PrimaryButton, SecondaryButton, ButtonGroup |
| apps/backoffice/src/shared/components/layout/DetailPageLayout.tsx | 상세 조회 페이지 레이아웃 | DetailPageLayout |
| apps/backoffice/src/shared/components/layout/ListPageLayout.tsx | 목록 페이지 레이아웃 | ListPageLayout |
| apps/backoffice/src/shared/components/layout/DescriptionList.tsx | 키-값 목록 표시 컴포넌트 | DescriptionList |
| apps/backoffice/src/shared/components/layout/index.ts | 레이아웃 컴포넌트 배럴 export | - |

## 핵심 흐름

1. 페이지 컴포넌트에서 레이아웃 Compound Component를 import하여 조합
2. `Container` → `Content` → `Header` + `Cards` 순서로 중첩
3. 공통 버튼(`PrimaryButton`, `SecondaryButton`)은 Header 내 액션 영역에 배치

## 스타일링 주의사항

- Tailwind JIT 모드에서 동적 클래스 문자열 보간(`w-[${variable}]`)은 빌드 시 인식되지 않음
- 정적 클래스(`w-[860px]`)를 사용하거나, Tailwind의 safelist에 등록해야 함
- `$` 접두사 transient prop은 조건부 boolean 스타일링에만 사용 권장

## 관련 Business Context

- 백오피스 관리자가 브랜드, 상품 등을 생성/수정하는 폼 페이지에서 사용
