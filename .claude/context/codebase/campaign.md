---
name: Campaign
description: 백오피스 캠페인 관리 - 리스트 조회(캠페인/상품별), CRUD, 인플루언서 배정, 수수료 관리
keywords: [캠페인, Campaign, 인플루언서, 상품, 수수료, 리스트, findAll, findAllByProduct]
---

# Campaign 모듈

백오피스에서 마케팅 캠페인을 관리하는 모듈. 캠페인 CRUD, 상품-캠페인 연결, 인플루언서 배정 및 커미션 설정, 주문/매출 통계 집계를 담당한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/api/src/module/backoffice/campaign/campaign.schema.ts | Zod 스키마 정의 (입출력 검증) | createCampaignInputSchema, findAllCampaignsInputSchema, findAllCampaignProductsInputSchema |
| apps/api/src/module/backoffice/campaign/campaign.type.ts | Zod 추론 타입 re-export | Campaign, FindAllCampaignsInput, FindAllCampaignProductsInput |
| apps/api/src/module/backoffice/campaign/campaign.dto.ts | DTO 타입 + Entity 응답 타입 | FindAllCampaignsOutput, FindAllCampaignProductsOutput, CampaignWithRelations |
| apps/api/src/module/backoffice/campaign/campaign.service.ts | 비즈니스 로직 | findAll(), findAllByProduct(), findById(), create(), update(), delete() |
| apps/api/src/module/backoffice/campaign/campaign.controller.ts | NestJS 메시지 핸들러 | @MessagePattern('backoffice.campaign.*') |
| apps/api/src/module/backoffice/campaign/campaign.router.ts | tRPC API 게이트웨이 | backofficeCampaign.findAll, findAllByProduct, findById, create, update, delete |
| apps/backoffice/src/routes/_auth/campaign/index.tsx | 캠페인 리스트 페이지 | 듀얼 뷰모드(캠페인/상품별), 필터, 페이지네이션 |
| apps/backoffice/src/routes/_auth/campaign/_components/CampaignTable.tsx | 테이블 컴포넌트 | CampaignViewTable, ProductViewTable |
| apps/backoffice/src/routes/_auth/campaign/_components/CampaignList.tsx | 레거시 리스트 컴포넌트 | CampaignList |
| packages/api-types/src/server.ts | tRPC 라우터 타입 공유 | backofficeCampaign 라우터 정의 |

## 핵심 흐름

### 캠페인 리스트 조회

1. 프론트엔드 → `trpc.backofficeCampaign.findAll` / `findAllByProduct` 호출
2. campaign.router.ts → MicroserviceClient.send() → campaign.controller.ts
3. campaign.service.ts → QueryBuilder로 필터/페이지네이션 적용
4. 배치 로딩으로 N+1 방지: `loadInfluencersByCampaignIds`, `loadBrandsByCampaignIds`, `loadOrderStatsByCampaignIds`
5. 응답: `{ data[], total, page, limit, totalPages }`

### 듀얼 뷰모드 (프론트엔드)

- **캠페인보기**: findAll → 캠페인별 인플루언서/브랜드/주문/매출 집계
- **상품별보기**: findAllByProduct → 상품별 캠페인/브랜드/카테고리/주문/매출 집계
- 비활성 뷰는 `{ page: 1, limit: 1 }`로 최소 요청 (최적화)

### 캠페인 생성/수정

1. Campaign → CampaignProduct → CampaignInfluencer → CampaignInfluencerProduct → CampaignInfluencerHotelOption 순서 생성
2. 수정 시 기존 관계 엔티티 삭제 후 재생성

## 주요 패턴

| 패턴 | 설명 |
|------|------|
| Zod-First | schema.ts가 단일 진실 소스, type.ts에서 z.infer로 타입 추론 |
| N+1 방지 | 배치 로딩 함수로 관련 데이터 일괄 조회 |
| 듀얼 뷰 최적화 | 활성 뷰만 전체 데이터 요청, 비활성 뷰는 최소 요청 |
| 계층적 삭제 | hotelOptions → influencerProducts → influencers/products 역순 삭제 |

## 관련 Business Context

- [캠페인 관리](../business/campaign-management.md)

## 관련 Domain Context

- [캠페인 도메인](../domain/campaign.md)
