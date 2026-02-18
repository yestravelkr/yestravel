---
name: backoffice-excel-export
description: 백오피스 주문/정산 엑셀 내보내기 - ExcelJS 기반 워크북 생성, S3 업로드, presigned URL 반환
keywords: [excel, 엑셀, export, 내보내기, exceljs, workbook, order, settlement, 정산, S3, xlsx]
estimated_tokens: ~500
---

# Backoffice Excel Export 모듈

주문(Order)과 정산(Settlement) 데이터를 ExcelJS로 엑셀 파일로 변환하여 S3에 업로드하고 presigned URL을 반환하는 기능이다.

## 파일 구조

| 파일 | 역할 | 핵심 함수 |
|------|------|----------|
| apps/api/src/module/backoffice/order/order.service.ts | 주문 엑셀 내보내기 | OrderService.exportToExcel() |
| apps/api/src/module/backoffice/settlement/settlement.service.ts | 정산 엑셀 내보내기 | SettlementService.exportToExcel() |

## 핵심 흐름

```
데이터 조회 → ExcelJS Workbook 생성 → worksheet.addRow([...]) → Buffer.from(writeBuffer()) → S3 업로드 → presigned URL 반환
```

### 공통 패턴

1. `new ExcelJS.Workbook()` → `addWorksheet(시트명)`
2. `worksheet.columns = [{ header, key, width }]` 으로 컬럼 정의
3. `worksheet.addRow([값 배열])` 으로 데이터 추가 (배열 기반)
4. `Buffer.from(await workbook.xlsx.writeBuffer())` → ArrayBuffer를 Node.js Buffer로 변환
5. `s3Service.uploadBuffer({ buffer, fileName, path, contentType })` → S3 업로드
6. `s3Service.getPresignedUrl(fileKey, 3600)` → 1시간 유효 URL 반환

### 주문 내보내기 (OrderService.exportToExcel)

| 항목 | 값 |
|------|---|
| 컬럼 수 | 26개 |
| 데이터 구조 | 평탄한 행 (주문 1건 = 1행) |
| S3 경로 | exports/orders/ |
| 파일명 | orders_YYYYMMDD_HHmmss.xlsx |
| 주요 컬럼 | 주문번호, 타입, 상태, 캠페인, 인플루언서, 상품, 금액, 결제수단, 구매자 정보 |

### 정산 내보내기 (SettlementService.exportToExcel)

| 항목 | 값 |
|------|---|
| 컬럼 수 | 6개 |
| 데이터 구조 | 계층적 (캠페인별 상품 + 소계 + 총계) |
| S3 경로 | exports/settlements/ |
| 파일명 | 정산_[대상명]_[년월].xlsx |
| 주요 컬럼 | 캠페인, 상품, 옵션, 수량, 매출, 정산금액 |

## 주요 설계 결정

- **배열 기반 addRow**: `worksheet.addRow([값1, 값2, ...])` - 객체 기반 대신 배열 기반으로 행 추가
- **Buffer 변환**: ExcelJS `writeBuffer()`는 ArrayBuffer를 반환하므로 `Buffer.from()`으로 Node.js Buffer 변환 필요
- **헤더 스타일 미적용**: ExcelJS 기본 헤더 사용 (커스텀 스타일 제거)

## 관련 Business Context

- [엑셀 데이터 교환](../business/excel-data-exchange.md)
