---
name: Backoffice Influencer
description: 백오피스 인플루언서 관리 모듈 - 목록 조회, 등록, 수정, 검색 기능
keywords: [인플루언서, backoffice, influencer, 목록, 등록, 수정, 소셜미디어, 사업자정보]
---

# Backoffice Influencer

백오피스에서 인플루언서를 관리하는 프론트엔드 모듈이다. 목록 조회, 검색, 등록, 상세 조회/수정 기능을 제공한다. TanStack Router 파일 기반 라우팅과 tRPC를 사용한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/routes/_auth/influencer/index.tsx | 인플루언서 목록 페이지 | InfluencerListPage() |
| apps/backoffice/src/routes/_auth/influencer/$influencerId.tsx | 인플루언서 상세/수정 페이지 | InfluencerDetailPage(), InfluencerDetailContent() |
| apps/backoffice/src/routes/_auth/influencer/create.tsx | 인플루언서 등록 페이지 | InfluencerCreatePage() |
| apps/backoffice/src/routes/_auth/influencer/_components/InfluencerList.tsx | 목록 테이블 컴포넌트 | InfluencerList() |
| apps/backoffice/src/routes/_auth/influencer/_components/InfluencerForm.tsx | 등록/수정 폼 컴포넌트 | InfluencerForm() |

## 핵심 흐름

1. 목록 페이지(`/influencer`) → `backofficeInfluencer.findAll` tRPC 쿼리로 데이터 조회 → TanStack Table로 렌더링
2. 행 클릭 또는 수정 버튼 → `/influencer/$influencerId` 타입 안전 경로로 이동
3. 상세 페이지 → `backofficeInfluencer.findById` 쿼리 → InfluencerForm으로 조회/수정
4. 등록 페이지(`/influencer/create`) → InfluencerForm 입력 → `backofficeInfluencer.create` mutation

## 주요 패턴

- **TanStack Router 타입 안전 경로**: `to="/influencer/$influencerId"` + `params={{ influencerId: String(id) }}`
- **Suspense 경계**: 페이지마다 Suspense + fallback 적용, `useSuspenseQuery` 사용
- **공유 폼 컴포넌트**: InfluencerForm이 등록/수정 양쪽에서 재사용 (`isEditMode` 분기)
- **tRPC 라우터**: `backofficeInfluencer` (findAll, findById, create, update)
- **스타일링**: tailwind-styled-components (`tw`)

## 폼 필드 구조

| 섹션 | 필드 | 필수 |
|------|------|------|
| 기본 정보 | name, slug, email, phoneNumber, thumbnail | name, slug |
| 소셜미디어 | platform, url (동적 배열) | 최소 1개 |
| 사업자 정보 | type, name, licenseNumber, ceoName | 전체 필수 |
| 정산 계좌 | bankName, accountNumber, accountHolder | 선택 |

## 관련 Business Context

- [인플루언서 관리](../business/influencer-management.md)
