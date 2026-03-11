---
name: Campaign Backoffice UI
description: 백오피스 캠페인 관리 UI - 리스트/필터/테이블/생성/수정 페이지 및 SegmentControl 공유 컴포넌트
keywords: [캠페인, backoffice, 테이블, 필터, CampaignTable, CampaignFilters, SegmentControl, TanStack Table]
estimated_tokens: ~400
---

# Campaign Backoffice UI

백오피스에서 캠페인을 조회, 생성, 수정하는 프론트엔드 모듈. TanStack Table 기반 테이블 UI와 클라이언트 사이드 필터링/페이지네이션을 제공한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/backoffice/src/routes/_auth/campaign/index.tsx | 캠페인 리스트 페이지 | CampaignListPage, Route |
| apps/backoffice/src/routes/_auth/campaign/create.tsx | 캠페인 생성 페이지 | CampaignCreatePage, Route |
| apps/backoffice/src/routes/_auth/campaign/$campaignId.tsx | 캠페인 상세/수정 페이지 | CampaignDetailPage, convertApiToFormData() |
| apps/backoffice/src/routes/_auth/campaign/_components/CampaignTable.tsx | 캠페인 테이블 컴포넌트 | CampaignTable, CampaignViewMode, CampaignTableData |
| apps/backoffice/src/routes/_auth/campaign/_components/CampaignFilters.tsx | 캠페인 필터 컴포넌트 | CampaignFilters, CampaignFiltersState |
| apps/backoffice/src/shared/components/segment-control/SegmentControl.tsx | 세그먼트 토글 공유 컴포넌트 | SegmentControl\<T\>, SegmentControlItem, SegmentControlProps |

## 핵심 흐름

1. **리스트 조회**: CampaignListPage → tRPC API 호출 → CampaignFilters(필터링) + CampaignTable(테이블 렌더링)
2. **뷰 모드 전환**: SegmentControl로 "캠페인보기" / "상품별보기" 토글
3. **생성**: CampaignCreatePage → Form 입력 → API 변환 → tRPC mutation → 리스트로 이동
4. **수정**: CampaignDetailPage → API 응답을 Form 데이터로 변환(convertApiToFormData) → 편집 모드 토글 → 업데이트

## 주요 패턴

- **상태 관리**: URL search params로 필터/페이지네이션 상태 관리
- **테이블**: TanStack Table (createColumnHelper) + 커스텀 Table 공유 컴포넌트
- **필터**: CascadingPeriodFilter, SearchableSelect 조합
- **뷰 모드**: SegmentControl 제네릭 컴포넌트로 타입 안전한 토글

## 관련 Business Context

- [인플루언서 관리](../business/influencer-management.md)
- [캠페인 도메인](../domain/campaign.md)
