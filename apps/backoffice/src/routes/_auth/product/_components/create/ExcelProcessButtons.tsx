/**
 * ExcelProcessButtons - 엑셀 폼 다운로드/업로드 버튼 컴포넌트
 *
 * 엑셀 템플릿 다운로드 및 데이터 업로드 기능을 제공합니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import ExcelJS from 'exceljs';
import { Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

/** 엑셀 행 데이터 타입 */
export interface ExcelRowData {
  날짜: string;
  옵션명: string;
  재고: number | string;
  공급가: number | string;
  판매가: number | string;
  수수료: number | string;
}

export interface ExcelProcessButtonsProps {
  /** 다운로드 시 엑셀 데이터 제공 callback */
  onGetExcelData: () => ExcelRowData[];
  /** 업로드된 데이터 처리 callback */
  onUploadData: (data: ExcelRowData[]) => void;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  /** 다운로드 파일명 (확장자 제외) */
  fileName?: string;
}

const REQUIRED_COLUMNS = [
  '날짜',
  '옵션명',
  '재고',
  '공급가',
  '판매가',
  '수수료',
];

/**
 * Usage:
 * <ExcelProcessButtons
 *   onGetExcelData={() => excelData}
 *   onUploadData={(data) => applyData(data)}
 *   disabled={options.length === 0}
 * />
 */
export function ExcelProcessButtons({
  onGetExcelData,
  onUploadData,
  disabled = false,
  fileName = '상품_가격표_템플릿',
}: ExcelProcessButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 엑셀 폼 다운로드
   */
  const handleDownload = async () => {
    if (disabled) {
      toast.error('옵션을 먼저 설정해주세요.');
      return;
    }

    const excelData = onGetExcelData();

    if (excelData.length === 0) {
      toast.error('다운로드할 데이터가 없습니다.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('가격표');

    // 컬럼 정의 (헤더 + 너비)
    worksheet.columns = [
      { header: '날짜', key: '날짜', width: 12 },
      { header: '옵션명', key: '옵션명', width: 15 },
      { header: '재고', key: '재고', width: 10 },
      { header: '공급가', key: '공급가', width: 12 },
      { header: '판매가', key: '판매가', width: 12 },
      { header: '수수료', key: '수수료', width: 10 },
    ];

    // 데이터 행 추가
    excelData.forEach((row) => {
      worksheet.addRow(row);
    });

    // 버퍼 생성 후 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('엑셀 폼이 다운로드되었습니다.');
  };

  /**
   * 엑셀 업로드 버튼 클릭
   */
  const handleUploadClick = () => {
    if (disabled) {
      toast.error('옵션을 먼저 설정해주세요.');
      return;
    }
    fileInputRef.current?.click();
  };

  /**
   * 엑셀 파일 업로드 처리
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet || worksheet.rowCount <= 1) {
          toast.error('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // 헤더 행에서 컬럼명 추출 (row.values는 1-indexed)
        const headerRow = worksheet.getRow(1);
        const headers = (headerRow.values as unknown[])
          .slice(1)
          .map((h) => String(h ?? ''));

        // 유효성 검증
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col),
        );

        if (missingColumns.length > 0) {
          toast.error(`필수 컬럼이 없습니다: ${missingColumns.join(', ')}`);
          return;
        }

        // 데이터 행을 ExcelRowData로 변환
        const jsonData: ExcelRowData[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;

          const values = (row.values as unknown[]).slice(1);
          const rowData: Record<string, unknown> = {};

          headers.forEach((header, colIndex) => {
            if (header) {
              rowData[header] = values[colIndex];
            }
          });

          jsonData.push({
            날짜: String(rowData['날짜'] ?? ''),
            옵션명: String(rowData['옵션명'] ?? ''),
            재고: Number(rowData['재고']) || 0,
            공급가: Number(rowData['공급가']) || 0,
            판매가: Number(rowData['판매가']) || 0,
            수수료: Number(rowData['수수료']) || 0,
          });
        });

        if (jsonData.length === 0) {
          toast.error('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        onUploadData(jsonData);
      } catch (error) {
        console.error('엑셀 파싱 오류:', error);
        toast.error('엑셀 파일을 읽는 중 오류가 발생했습니다.');
      }
    };

    reader.readAsArrayBuffer(file);

    // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
    event.target.value = '';
  };

  return (
    <ButtonGroup>
      <Button
        kind="neutral"
        variant="outline"
        shape="soft"
        size="medium"
        onClick={handleDownload}
        leadingIcon={<Download size={20} />}
        disabled={disabled}
      >
        엑셀 폼 다운로드
      </Button>
      <Button
        kind="neutral"
        variant="outline"
        shape="soft"
        size="medium"
        onClick={handleUploadClick}
        leadingIcon={<Upload size={20} />}
        disabled={disabled}
      >
        엑셀 업로드
      </Button>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
    </ButtonGroup>
  );
}

// Styled Components

const ButtonGroup = tw.div`
  flex gap-2
`;

const HiddenFileInput = tw.input`
  hidden
`;
