/**
 * CommissionExcelModal - 수수료 엑셀 처리 모달
 *
 * 캠페인 인플루언서별 호텔 옵션 수수료를 엑셀로 다운로드/업로드/일괄적용하는 모달입니다.
 */

import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  useTabs,
} from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import ExcelJS from 'exceljs';
import { Calendar, Download, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';
import * as XLSX from 'xlsx';

import { openDateRangePickerModal } from '@/shared/components/DateRangePickerModal';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

interface HotelOption {
  id: number;
  name: string;
  priceByDate: Record<string, number>;
  anotherPriceByDate: Record<
    string,
    {
      supplyPrice: number;
      commission: number;
    }
  >;
}

interface Product {
  id: number;
  name: string;
  hotelOptions: HotelOption[];
}

interface CommissionData {
  hotelOptionId: number;
  commissionByDate: Record<string, number>;
}

interface CommissionExcelModalProps {
  product: Product;
  campaignStartDate: string;
  campaignEndDate: string;
  currentCommissionData: CommissionData[];
  onApply: (commissionData: CommissionData[]) => void;
}

interface ExcelRow {
  상품명: string;
  옵션명: string;
  날짜: string;
  수수료: number;
}

interface PreviewRow {
  hotelOptionId: number;
  optionName: string;
  date: string;
  commission: number;
  isValid: boolean;
  errorMessage: string | null;
}

interface PreviewData {
  validRows: PreviewRow[];
  invalidRows: PreviewRow[];
  totalCount: number;
  validCount: number;
  invalidCount: number;
}

const TABS = [
  { label: '다운로드', value: 'download' as const },
  { label: '업로드', value: 'upload' as const },
  { label: '일괄적용', value: 'bulk' as const },
];

/**
 * 다운로드 탭 콘텐츠
 */
function DownloadTab({
  product,
  currentCommissionData,
}: {
  product: Product;
  currentCommissionData: CommissionData[];
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 1. ExcelJS 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('수수료 설정');

      // 2. 컬럼 정의
      worksheet.columns = [
        { header: '상품명', key: 'productName', width: 30 },
        { header: '옵션명', key: 'optionName', width: 25 },
        { header: '날짜', key: 'date', width: 12 },
        { header: '판매가', key: 'price', width: 12 },
        { header: '기본수수료', key: 'defaultCommission', width: 12 },
        { header: '수수료', key: 'currentCommission', width: 12 },
      ];

      // 3. 헤더 스타일
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // 4. 데이터 행 추가
      product.hotelOptions.forEach((option) => {
        const customOption = currentCommissionData.find(
          (c) => c.hotelOptionId === option.id,
        );
        const dates = Object.keys(option.priceByDate);

        dates.forEach((date) => {
          worksheet.addRow({
            productName: product.name,
            optionName: option.name,
            date,
            price: option.priceByDate[date],
            defaultCommission: option.anotherPriceByDate[date]?.commission ?? 0,
            currentCommission: customOption?.commissionByDate[date] ?? '',
          });
        });
      });

      // 5. 브라우저 다운로드
      const fileName = `수수료_${product.name}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('엑셀 파일이 다운로드되었습니다');
    } catch {
      toast.error('엑셀 다운로드 중 오류가 발생했습니다');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TabContainer>
      <Description>
        현재 설정된 수수료를 엑셀 파일로 다운로드합니다.
      </Description>

      <InfoBox>
        <InfoItem>
          - 상품명, 옵션명, 날짜, 판매가, 기본수수료, 수수료 포함
        </InfoItem>
        <InfoItem>- 수수료가 설정되지 않은 경우 빈 칸으로 표시됩니다</InfoItem>
      </InfoBox>

      <ActionButton onClick={handleDownload} disabled={downloading}>
        <Download size={20} />
        엑셀 다운로드
      </ActionButton>
    </TabContainer>
  );
}

/**
 * 업로드 탭 콘텐츠
 */
function UploadTab({
  product,
  campaignStartDate,
  campaignEndDate,
  onApply,
  onClose,
}: {
  product: Product;
  campaignStartDate: string;
  campaignEndDate: string;
  onApply: (commissionData: CommissionData[]) => void;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // 1. XLSX 파싱
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        if (jsonData.length === 0) {
          toast.error('엑셀 파일에 데이터가 없습니다');
          return;
        }

        // 2. 필수 컬럼 검증
        const REQUIRED_COLUMNS = ['상품명', '옵션명', '날짜', '수수료'];
        const firstRow = jsonData[0];
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !(col in firstRow),
        );
        if (missingColumns.length > 0) {
          toast.error(`필수 컬럼이 없습니다: ${missingColumns.join(', ')}`);
          return;
        }

        // 3. 유효성 검증
        const validRows: PreviewRow[] = [];
        const invalidRows: PreviewRow[] = [];
        const optionNameMap = new Map(
          product.hotelOptions.map((opt) => [opt.name, opt]),
        );

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

        setPreviewData({
          validRows,
          invalidRows,
          totalCount: jsonData.length,
          validCount: validRows.length,
          invalidCount: invalidRows.length,
        });
      } catch {
        toast.error('엑셀 파일을 읽는 중 오류가 발생했습니다');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApplyUpload = () => {
    if (!previewData || previewData.validCount === 0) {
      toast.error('적용할 유효한 데이터가 없습니다');
      return;
    }

    // validRows를 CommissionData로 변환
    const optionMap = new Map<number, Record<string, number>>();

    previewData.validRows.forEach((row) => {
      if (!optionMap.has(row.hotelOptionId)) {
        optionMap.set(row.hotelOptionId, {});
      }
      optionMap.get(row.hotelOptionId)![row.date] = row.commission;
    });

    const commissionData = Array.from(optionMap.entries()).map(
      ([hotelOptionId, commissionByDate]) => ({
        hotelOptionId,
        commissionByDate,
      }),
    );

    onApply(commissionData);
    toast.success(`${previewData.validCount}건의 수수료가 적용되었습니다`);
    onClose();
  };

  return (
    <TabContainer>
      <Description>
        엑셀 파일을 업로드하여 수수료를 일괄 변경합니다.
      </Description>

      <FileUploadSection>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <ActionButton onClick={() => fileInputRef.current?.click()}>
          <Upload size={20} />
          파일 선택
        </ActionButton>
        {selectedFile && <FileName>{selectedFile.name}</FileName>}
      </FileUploadSection>

      {previewData && (
        <PreviewSection>
          <PreviewStats>
            <StatItem>전체 {previewData.totalCount}건</StatItem>
            <StatItem $success>유효 {previewData.validCount}건</StatItem>
            <StatItem $error={previewData.invalidCount > 0}>
              오류 {previewData.invalidCount}건
            </StatItem>
          </PreviewStats>

          {/* 유효한 데이터 테이블 */}
          {previewData.validCount > 0 && (
            <PreviewTableContainer>
              <TableTitle>유효한 데이터</TableTitle>
              <Table>
                <THead>
                  <TR>
                    <TH>옵션명</TH>
                    <TH>날짜</TH>
                    <TH>수수료</TH>
                  </TR>
                </THead>
                <TBody>
                  {previewData.validRows.slice(0, 10).map((row) => (
                    <TR key={`${row.hotelOptionId}-${row.date}`}>
                      <TD>{row.optionName}</TD>
                      <TD>{row.date}</TD>
                      <TD>{row.commission.toLocaleString()}원</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              {previewData.validRows.length > 10 && (
                <TableFooter>
                  외 {previewData.validRows.length - 10}건
                </TableFooter>
              )}
            </PreviewTableContainer>
          )}

          {/* 오류 데이터 테이블 */}
          {previewData.invalidCount > 0 && (
            <ErrorSection>
              <ErrorTitle>오류가 발견되었습니다</ErrorTitle>
              <PreviewTableContainer>
                <Table>
                  <THead>
                    <TR>
                      <TH>옵션명</TH>
                      <TH>날짜</TH>
                      <TH>수수료</TH>
                      <TH>오류</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {previewData.invalidRows.map((row) => (
                      <ErrorRow key={`${row.hotelOptionId}-${row.date}`}>
                        <TD>{row.optionName}</TD>
                        <TD>{row.date}</TD>
                        <TD>{row.commission.toLocaleString()}원</TD>
                        <TD>{row.errorMessage}</TD>
                      </ErrorRow>
                    ))}
                  </TBody>
                </Table>
              </PreviewTableContainer>
            </ErrorSection>
          )}

          {previewData.validCount > 0 && (
            <ApplyButton onClick={handleApplyUpload}>
              유효한 데이터만 적용 ({previewData.validCount}건)
            </ApplyButton>
          )}
        </PreviewSection>
      )}
    </TabContainer>
  );
}

/**
 * 일괄적용 탭 콘텐츠
 */
function BulkApplyTab({
  product,
  campaignStartDate,
  campaignEndDate,
  onApply,
  onClose,
}: {
  product: Product;
  campaignStartDate: string;
  campaignEndDate: string;
  onApply: (commissionData: CommissionData[]) => void;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState<string>(campaignStartDate);
  const [endDate, setEndDate] = useState<string>(campaignEndDate);
  const [fee, setFee] = useState<number>(0);

  const handleDateRangeClick = async () => {
    const result = await openDateRangePickerModal({
      startDate,
      endDate,
    });
    if (result) {
      setStartDate(result.startDate);
      setEndDate(result.endDate);
    }
  };

  const handleBulkApply = () => {
    if (!startDate || !endDate) {
      toast.error('날짜 범위를 선택해주세요');
      return;
    }

    if (fee < 0) {
      toast.error('수수료는 0 이상이어야 합니다');
      return;
    }

    // 날짜 범위 생성
    const dates: string[] = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    // 모든 옵션 × 날짜 범위 → CommissionData
    const commissionData = product.hotelOptions.map((option) => {
      const commissionByDate: Record<string, number> = {};
      dates.forEach((date) => {
        // 해당 날짜에 판매가가 있는 경우만 수수료 적용
        if (option.priceByDate[date] !== undefined) {
          commissionByDate[date] = fee;
        }
      });
      return {
        hotelOptionId: option.id,
        commissionByDate,
      };
    });

    onApply(commissionData);
    toast.success(
      `${dates.length}일 × ${product.hotelOptions.length}개 옵션에 수수료가 적용되었습니다`,
    );
    onClose();
  };

  return (
    <TabContainer>
      <Description>
        특정 기간의 모든 옵션에 동일한 수수료를 적용합니다.
      </Description>

      <FormField>
        <Label>날짜 범위</Label>
        <DateRangeInput type="button" onClick={handleDateRangeClick}>
          <Calendar size={20} />
          <DateRangeText>
            {dayjs(startDate).format('YY.MM.DD')} ~{' '}
            {dayjs(endDate).format('YY.MM.DD')}
          </DateRangeText>
        </DateRangeInput>
      </FormField>

      <FormField>
        <Label>수수료</Label>
        <FeeInputWrapper>
          <FeeInput
            type="text"
            value={fee.toLocaleString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/,/g, '');
              setFee(parseInt(value, 10) || 0);
            }}
            placeholder="0"
          />
          <FeeUnit>원</FeeUnit>
        </FeeInputWrapper>
      </FormField>

      <WarningBox>
        선택한 기간의 모든 호텔 옵션에 동일한 수수료가 적용됩니다. 기존 설정된
        수수료는 완전히 대체됩니다.
      </WarningBox>

      <ApplyButton onClick={handleBulkApply} disabled={!startDate || !endDate}>
        일괄 적용
      </ApplyButton>
    </TabContainer>
  );
}

function CommissionExcelModal({
  product,
  campaignStartDate,
  campaignEndDate,
  currentCommissionData,
  onApply,
}: CommissionExcelModalProps) {
  const { resolveModal } = useCurrentModal();
  const { selectedTab, TabComponents } = useTabs(TABS);

  const handleApply = (commissionData: CommissionData[]) => {
    onApply(commissionData);
    resolveModal(commissionData);
  };

  const handleClose = () => {
    resolveModal(null);
  };

  return (
    <Container>
      {/* 헤더 영역 */}
      <HeaderSection>
        <HeaderTitle>수수료 엑셀 처리</HeaderTitle>
        <TabComponents />
      </HeaderSection>

      {/* 콘텐츠 영역 */}
      <Content>
        {selectedTab === 'download' && (
          <DownloadTab
            product={product}
            currentCommissionData={currentCommissionData}
          />
        )}
        {selectedTab === 'upload' && (
          <UploadTab
            product={product}
            campaignStartDate={campaignStartDate}
            campaignEndDate={campaignEndDate}
            onApply={handleApply}
            onClose={handleClose}
          />
        )}
        {selectedTab === 'bulk' && (
          <BulkApplyTab
            product={product}
            campaignStartDate={campaignStartDate}
            campaignEndDate={campaignEndDate}
            onApply={handleApply}
            onClose={handleClose}
          />
        )}
      </Content>

      {/* 푸터 영역 */}
      <Footer>
        <CancelButton type="button" onClick={handleClose}>
          닫기
        </CancelButton>
      </Footer>
    </Container>
  );
}

export function openCommissionExcelModal(
  props: CommissionExcelModalProps,
): Promise<CommissionData[] | null> {
  return SnappyModal.show(<CommissionExcelModal {...props} />, {
    position: 'center',
  });
}

// ============================================
// Styled Components
// ============================================

const Container = tw.div`
  w-[800px]
  max-h-[90vh]
  p-5
  bg-[var(--bg-layer)]
  rounded-[20px]
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  flex-col
  justify-start
  items-start
  gap-5
  overflow-hidden
`;

const HeaderSection = tw.div`
  self-stretch
  flex
  flex-col
  justify-start
  items-start
  gap-2
`;

const HeaderTitle = tw.div`
  self-stretch
  h-9
  inline-flex
  justify-start
  items-center
  gap-2
  text-[var(--fg-neutral)]
  text-xl
  font-bold
  leading-7
`;

const Content = tw.div`
  self-stretch
  flex
  flex-col
  gap-5
  overflow-y-auto
  max-h-[calc(90vh-180px)]
`;

const TabContainer = tw.div`
  self-stretch
  flex
  flex-col
  gap-5
`;

const Description = tw.div`
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const InfoBox = tw.div`
  self-stretch
  p-4
  bg-[var(--bg-neutral)]
  rounded-xl
  flex
  flex-col
  gap-2
`;

const InfoItem = tw.div`
  text-[var(--fg-muted)]
  text-sm
  font-normal
  leading-4
`;

const ActionButton = tw.button`
  h-11
  px-4
  bg-[var(--bg-neutral-solid)]
  rounded-xl
  flex
  justify-center
  items-center
  gap-2
  text-[var(--fg-on-surface)]
  text-base
  font-medium
  leading-5
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const FileUploadSection = tw.div`
  self-stretch
  flex
  items-center
  gap-3
`;

const FileName = tw.div`
  flex-1
  text-[var(--fg-neutral)]
  text-sm
  font-normal
  leading-4
  truncate
`;

const PreviewSection = tw.div`
  self-stretch
  flex
  flex-col
  gap-4
`;

const PreviewStats = tw.div`
  self-stretch
  flex
  items-center
  gap-3
`;

const StatItem = tw.div<{ $success?: boolean; $error?: boolean }>`
  px-3
  py-1
  rounded-lg
  text-sm
  font-medium
  ${({ $success, $error }) =>
    $success
      ? 'bg-green-100 text-green-700'
      : $error
        ? 'bg-red-100 text-red-700'
        : 'bg-[var(--bg-neutral)] text-[var(--fg-neutral)]'}
`;

const PreviewTableContainer = tw.div`
  self-stretch
  overflow-x-auto
  border
  border-[var(--stroke-neutral)]
  rounded-lg
`;

const TableTitle = tw.div`
  px-4
  py-2
  bg-[var(--bg-neutral)]
  text-[var(--fg-neutral)]
  text-sm
  font-medium
  leading-4
`;

const TableFooter = tw.div`
  px-4
  py-2
  bg-[var(--bg-neutral)]
  text-center
  text-[var(--fg-muted)]
  text-sm
  font-normal
  leading-4
`;

const ErrorSection = tw.div`
  self-stretch
  flex
  flex-col
  gap-2
`;

const ErrorTitle = tw.div`
  text-[var(--fg-error)]
  text-base
  font-medium
  leading-5
`;

const ErrorRow = tw(TR)`
  bg-red-50
`;

const ApplyButton = tw.button`
  h-11
  px-4
  bg-[var(--bg-primary-solid)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-on-surface)]
  text-base
  font-medium
  leading-5
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const FormField = tw.div`
  self-stretch
  flex
  flex-col
  gap-2
`;

const Label = tw.div`
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const DateRangeInput = tw.button`
  self-stretch
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-center
  gap-2
  transition-colors
  text-[var(--fg-neutral)]
  cursor-pointer
`;

const DateRangeText = tw.span`
  flex-1
  text-left
  text-base
  font-normal
  leading-5
`;

const FeeInputWrapper = tw.div`
  self-stretch
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-center
  gap-1
`;

const FeeInput = tw.input`
  flex-1
  bg-transparent
  text-[var(--fg-neutral)]
  text-base
  font-normal
  leading-5
  outline-none
  text-right
`;

const FeeUnit = tw.span`
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const WarningBox = tw.div`
  self-stretch
  p-4
  bg-yellow-50
  border
  border-yellow-200
  rounded-xl
  text-yellow-800
  text-sm
  font-normal
  leading-4
`;

const Footer = tw.div`
  self-stretch
  inline-flex
  justify-end
  items-start
  gap-2
`;

const CancelButton = tw.button`
  h-11
  min-w-11
  px-4
  bg-[var(--bg-neutral)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-neutral)]
  text-base
  font-medium
  leading-5
`;

/**
 * Usage:
 *
 * const handleOpenExcelModal = async () => {
 *   const result = await openCommissionExcelModal({
 *     product: {
 *       id: 1,
 *       name: '상품명',
 *       hotelOptions: [...],
 *     },
 *     campaignStartDate: '2025-01-01',
 *     campaignEndDate: '2025-12-31',
 *     currentCommissionData: [...],
 *     onApply: (commissionData) => {
 *       // react-hook-form에 데이터 주입
 *     },
 *   });
 * };
 */
