/**
 * CommissionExcelModal - 공통 유틸리티 함수
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ExcelJS from 'exceljs';

import type {
  CommissionData,
  ExcelRow,
  HotelOption,
  PreviewData,
  PreviewRow,
  Product,
} from './types';

dayjs.extend(customParseFormat);

/**
 * ExcelJS 워크북을 생성하여 수수료 데이터를 담은 Buffer를 반환한다.
 */
export async function generateExcelWorkbook(
  product: Product,
  currentCommissionData: CommissionData[],
): Promise<{ buffer: ArrayBuffer; fileName: string }> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('수수료 설정');

  // 컬럼 정의 (헤더 + 너비)
  worksheet.columns = [
    { header: '상품명', key: 'productName', width: 30 },
    { header: '옵션명', key: 'optionName', width: 25 },
    { header: '날짜', key: 'date', width: 12 },
    { header: '판매가', key: 'price', width: 12 },
    { header: '기본수수료', key: 'baseCommission', width: 12 },
    { header: '수수료', key: 'commission', width: 12 },
  ];

  // 데이터 행 추가
  product.hotelOptions.forEach((option) => {
    const customOption = currentCommissionData.find(
      (c) => c.hotelOptionId === option.id,
    );
    const dates = Object.keys(option.priceByDate);

    dates.forEach((date) => {
      worksheet.addRow([
        product.name,
        option.name,
        date,
        option.priceByDate[date],
        option.anotherPriceByDate[date]?.commission ?? 0,
        customOption?.commissionByDate[date] ?? '',
      ]);
    });
  });

  const fileName = `수수료_${product.name}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  return { buffer, fileName };
}

/**
 * 엑셀 파일을 파싱하여 ExcelRow 배열을 반환한다.
 * 필수 컬럼이 없으면 에러를 throw 한다.
 */
export async function parseExcelFile(data: ArrayBuffer): Promise<ExcelRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const worksheet = workbook.getWorksheet(1);

  if (!worksheet || worksheet.rowCount <= 1) {
    throw new Error('엑셀 파일에 데이터가 없습니다');
  }

  // 헤더 행에서 컬럼명 추출 (row.values는 1-indexed)
  const headerRow = worksheet.getRow(1);
  const headers = (headerRow.values as unknown[])
    .slice(1)
    .map((h) => String(h ?? ''));

  const REQUIRED_COLUMNS = ['상품명', '옵션명', '날짜', '수수료'];
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col),
  );
  if (missingColumns.length > 0) {
    throw new Error(`필수 컬럼이 없습니다: ${missingColumns.join(', ')}`);
  }

  // 데이터 행을 ExcelRow로 변환
  const jsonData: ExcelRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 헤더 행 건너뛰기

    const values = (row.values as unknown[]).slice(1);
    const rowData: Record<string, unknown> = {};

    headers.forEach((header, colIndex) => {
      if (header) {
        rowData[header] = values[colIndex];
      }
    });

    // 필수 필드가 하나라도 있는 행만 추가
    if (rowData['옵션명'] || rowData['날짜'] || rowData['수수료']) {
      jsonData.push({
        상품명: String(rowData['상품명'] ?? ''),
        옵션명: String(rowData['옵션명'] ?? ''),
        날짜: String(rowData['날짜'] ?? ''),
        수수료: Number(rowData['수수료']) || 0,
      });
    }
  });

  if (jsonData.length === 0) {
    throw new Error('엑셀 파일에 데이터가 없습니다');
  }

  return jsonData;
}

/**
 * 업로드된 엑셀 데이터를 검증하여 유효/무효 행으로 분류한다.
 */
export function validateExcelData(
  jsonData: ExcelRow[],
  hotelOptions: HotelOption[],
  campaignStartDate: string,
  campaignEndDate: string,
): PreviewData {
  const validRows: PreviewRow[] = [];
  const invalidRows: PreviewRow[] = [];
  const optionNameMap = new Map(hotelOptions.map((opt) => [opt.name, opt]));

  jsonData.forEach((row) => {
    const { 옵션명, 날짜, 수수료 } = row;

    // 옵션명 매칭
    const hotelOption = optionNameMap.get(옵션명);
    if (!hotelOption) {
      invalidRows.push({
        hotelOptionId: 0,
        optionName: 옵션명,
        date: String(날짜),
        commission: Number(수수료) || 0,
        isValid: false,
        errorMessage: '존재하지 않는 옵션명입니다',
      });
      return;
    }

    // 날짜 형식 검증
    const dateStr = String(날짜);
    if (!dayjs(dateStr, 'YYYY-MM-DD', true).isValid()) {
      invalidRows.push({
        hotelOptionId: hotelOption.id,
        optionName: 옵션명,
        date: dateStr,
        commission: Number(수수료) || 0,
        isValid: false,
        errorMessage: '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)',
      });
      return;
    }

    // 날짜 범위 검증
    const dateObj = dayjs(dateStr);
    if (
      dateObj.isBefore(campaignStartDate, 'day') ||
      dateObj.isAfter(campaignEndDate, 'day')
    ) {
      invalidRows.push({
        hotelOptionId: hotelOption.id,
        optionName: 옵션명,
        date: dateStr,
        commission: Number(수수료) || 0,
        isValid: false,
        errorMessage: '캠페인 기간 외의 날짜입니다',
      });
      return;
    }

    // 수수료 검증
    const commissionValue = Number(수수료);
    if (isNaN(commissionValue) || commissionValue < 0) {
      invalidRows.push({
        hotelOptionId: hotelOption.id,
        optionName: 옵션명,
        date: dateStr,
        commission: 0,
        isValid: false,
        errorMessage: '수수료는 0 이상의 숫자여야 합니다',
      });
      return;
    }

    // 유효한 행
    validRows.push({
      hotelOptionId: hotelOption.id,
      optionName: 옵션명,
      date: dateStr,
      commission: commissionValue,
      isValid: true,
      errorMessage: null,
    });
  });

  return {
    validRows,
    invalidRows,
    totalCount: jsonData.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
  };
}

/**
 * PreviewRow 배열을 CommissionData 배열로 변환한다.
 */
export function convertToCommissionData(
  validRows: PreviewRow[],
): CommissionData[] {
  const optionMap = new Map<number, Record<string, number>>();

  validRows.forEach((row) => {
    if (!optionMap.has(row.hotelOptionId)) {
      optionMap.set(row.hotelOptionId, {});
    }
    optionMap.get(row.hotelOptionId)![row.date] = row.commission;
  });

  return Array.from(optionMap.entries()).map(
    ([hotelOptionId, commissionByDate]) => ({
      hotelOptionId,
      commissionByDate,
    }),
  );
}
