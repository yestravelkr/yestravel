/**
 * CommissionExcelModal - 수수료 엑셀 처리 모달
 *
 * 캠페인 인플루언서별 호텔 옵션 수수료를 엑셀로 다운로드/업로드하는 모달입니다.
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
import { Download, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import type {
  CommissionData,
  CommissionExcelModalProps,
  PreviewData,
  Product,
} from './types';
import {
  generateExcelWorkbook,
  parseExcelFile,
  validateExcelData,
  convertToCommissionData,
} from './utils';

const TABS = [
  { label: '다운로드', value: 'download' as const },
  { label: '업로드', value: 'upload' as const },
];

// ============================================
// DownloadTab Component
// ============================================

interface DownloadTabProps {
  product: Product;
  currentCommissionData: CommissionData[];
}

function DownloadTab({ product, currentCommissionData }: DownloadTabProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { buffer, fileName } = await generateExcelWorkbook(
        product,
        currentCommissionData,
      );

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

// ============================================
// UploadTab Component
// ============================================

interface UploadTabProps {
  product: Product;
  campaignStartDate: string;
  campaignEndDate: string;
  onApply: (commissionData: CommissionData[]) => void;
  onClose: () => void;
}

function UploadTab({
  product,
  campaignStartDate,
  campaignEndDate,
  onApply,
  onClose,
}: UploadTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const jsonData = await parseExcelFile(data);
        const preview = validateExcelData(
          jsonData,
          product.hotelOptions,
          campaignStartDate,
          campaignEndDate,
        );
        setPreviewData(preview);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('엑셀 파일을 읽는 중 오류가 발생했습니다');
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApplyUpload = () => {
    if (!previewData || previewData.validCount === 0) {
      toast.error('적용할 유효한 데이터가 없습니다');
      return;
    }

    const commissionData = convertToCommissionData(previewData.validRows);
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

// ============================================
// CommissionExcelModal Component
// ============================================

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
  overflow-y-auto
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

// DownloadTab Styled Components
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

// UploadTab Styled Components
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
