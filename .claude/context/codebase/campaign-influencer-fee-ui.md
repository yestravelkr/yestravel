---
name: campaign-influencer-fee-ui
description: 백오피스 캠페인 인플루언서 수수료 관리 프론트엔드 - 판매설정 모달, 수수료 엑셀 처리
keywords: [campaign, influencer, fee, commission, 수수료, 커미션, 엑셀, modal, backoffice, 프론트엔드, 판매설정]
estimated_tokens: ~600
---

# Campaign Influencer Fee UI 모듈

백오피스 캠페인의 인플루언서별 수수료/커미션을 관리하는 프론트엔드 컴포넌트 모듈이다. 판매설정 모달과 엑셀 처리 모달로 구성된다.

## 파일 구조

| 파일 | 역할 | 핵심 컴포넌트/함수 |
|------|------|-----------------|
| apps/backoffice/src/components/campaign/InfluencerSalesSettingModal.tsx | 인플루언서 판매설정 모달 | InfluencerSalesSettingModal, openInfluencerSalesSettingModal() |
| apps/backoffice/src/components/campaign/CommissionExcelModal/index.tsx | 수수료 엑셀 처리 모달 | CommissionExcelModal, openCommissionExcelModal() |
| apps/backoffice/src/components/campaign/CommissionExcelModal/types.ts | 타입 정의 | CommissionData, PreviewData, ExcelRow |
| apps/backoffice/src/components/campaign/CommissionExcelModal/utils.ts | 엑셀 유틸리티 | generateExcelWorkbook(), parseExcelFile(), validateExcelData(), convertToCommissionData() |
| apps/backoffice/src/routes/_auth/campaign/_components/CampaignInfluencerSection.tsx | 인플루언서 테이블 섹션 | CampaignInfluencerSection |
| apps/backoffice/src/routes/_auth/campaign/_components/types.ts | 폼 타입 정의 | CampaignInfluencerFormData, CampaignInfluencerProductFormData |
| apps/backoffice/src/routes/_auth/product/_components/create/ExcelProcessButtons.tsx | 상품 옵션 엑셀 처리 | ExcelProcessButtons (xlsx→exceljs 마이그레이션) |

## 핵심 흐름

### 인플루언서 판매설정 흐름

```
CampaignInfluencerSection (테이블)
  └─ [판매설정] 클릭
      └─ InfluencerSalesSettingModal (2탭 모달)
          ├─ Tab 1: 캠페인 설정
          │   - periodType (DEFAULT/CUSTOM) + 날짜 선택
          │   - feeType (NONE/CUSTOM) + 금액 입력
          └─ Tab 2: 상품 판매 설정
              - 상품별 status (VISIBLE/HIDDEN/SOLD_OUT)
              - useCustomCommission 토글
              └─ [엑셀 처리] 클릭
                  └─ CommissionExcelModal (2탭 모달)
                      ├─ 다운로드: 현재 커미션 데이터를 엑셀로 내보내기
                      └─ 업로드: 엑셀 파일 업로드 → 검증 → 미리보기 → 적용
```

### 엑셀 다운로드 흐름

1. `generateExcelWorkbook(product, currentCommissionData)` → ExcelJS Workbook 생성
2. `workbook.xlsx.writeBuffer()` → ArrayBuffer 반환
3. `new Blob([buffer])` → Blob 변환 → 브라우저 다운로드

### 엑셀 업로드 흐름

1. FileReader로 파일 읽기 → ArrayBuffer
2. `parseExcelFile(ArrayBuffer)` → ExcelJS로 파싱 → ExcelRow[] 반환
3. `validateExcelData(rows, hotelOptions, startDate, endDate)` → 유효/무효 행 분류
4. 미리보기 테이블 표시 (유효/오류 행)
5. `convertToCommissionData(validRows)` → CommissionData[] 변환 → 폼에 적용

### 폼 데이터 구조

```typescript
CampaignInfluencerFormData = {
  influencerId: number
  periodType: 'DEFAULT' | 'CUSTOM'
  startAt: string | null
  endAt: string | null
  feeType: 'NONE' | 'CUSTOM'
  fee: number | null
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT'
  products: CampaignInfluencerProductFormData[]
}

CampaignInfluencerProductFormData = {
  productId: number
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT'
  useCustomCommission: boolean
  hotelOptions: {
    hotelOptionId: number
    commissionByDate: Record<string, number>  // {"YYYY-MM-DD": 금액}
  }[]
}
```

### 상품 자동 동기화 (CampaignInfluencerSection)

- 캠페인 상품 변경 시 인플루언서의 products[] 자동 동기화
- 기존 커미션 데이터 보존, 신규 상품 기본값 추가, 삭제된 상품 제거

## ExcelJS 마이그레이션 (xlsx → exceljs)

| 변경 대상 | 이전 (xlsx) | 이후 (exceljs) |
|----------|------------|---------------|
| CommissionExcelModal/utils.ts | - | ExcelJS 직접 사용 (신규) |
| ExcelProcessButtons.tsx | XLSX.utils, XLSX.write, XLSX.read | ExcelJS Workbook, writeBuffer(), load() |
| 패키지 | xlsx ^0.18.5 | exceljs ^4.4.0 |

## 관련 Codebase Context

- [Backoffice Campaign](./backoffice-campaign.md) - 백엔드 캠페인 서비스

## 관련 Business Context

- [캠페인 인플루언서 수수료](../business/campaign-influencer-fee.md)
- [엑셀 데이터 교환](../business/excel-data-exchange.md)
