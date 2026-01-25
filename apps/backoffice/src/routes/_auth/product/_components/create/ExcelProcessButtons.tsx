/**
 * ExcelProcessButtons - 엑셀 폼 다운로드/업로드 버튼 컴포넌트
 *
 * 엑셀 템플릿 다운로드 및 데이터 업로드 기능을 제공합니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';
import * as XLSX from 'xlsx';

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
  const handleDownload = () => {
    if (disabled) {
      toast.error('옵션을 먼저 설정해주세요.');
      return;
    }

    const excelData = onGetExcelData();

    if (excelData.length === 0) {
      toast.error('다운로드할 데이터가 없습니다.');
      return;
    }

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 12 }, // 날짜
      { wch: 15 }, // 옵션명
      { wch: 10 }, // 재고
      { wch: 12 }, // 공급가
      { wch: 12 }, // 판매가
      { wch: 10 }, // 수수료
    ];

    // 워크북 생성 및 다운로드
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '가격표');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

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
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRowData>(worksheet);

        if (jsonData.length === 0) {
          toast.error('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // 유효성 검증
        const firstRow = jsonData[0];
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !(col in firstRow),
        );

        if (missingColumns.length > 0) {
          toast.error(`필수 컬럼이 없습니다: ${missingColumns.join(', ')}`);
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
