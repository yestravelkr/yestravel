/**
 * SettlementDetailContent - 정산 상세 Presentational 컴포넌트
 *
 * 브랜드/인플루언서 정산 상세 페이지의 공통 UI를 렌더링합니다.
 * 데이터 페칭과 mutation 로직은 각 route 파일에서 처리하고,
 * 이 컴포넌트는 순수 렌더링만 담당합니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';
import { Card } from '@/shared/components';

/** 정산 상세 데이터 공통 타입 (구조적 타이핑으로 브랜드/인플루언서 응답 모두 호환) */
export interface SettlementDetailData {
  status: string;
  periodYear: number;
  periodMonth: number;
  scheduledAt: string;
  totalSales: number;
  totalQuantity: number;
  totalAmount: number;
  bankAccount: {
    bankName: string | null;
    accountNumber: string | null;
    accountHolder: string | null;
  };
  campaignGroups: Array<{
    campaignId: number;
    campaignName: string;
    campaignPeriod: string;
    subtotalQuantity: number;
    subtotalSales: number;
    subtotalAmount: number;
    products: Array<{
      productName: string;
      optionName: string | null;
      quantity: number;
      sales: number;
      settlementAmount: number;
    }>;
  }>;
}

/**
 * SettlementDetailContent Props
 */
export interface SettlementDetailContentProps {
  /** 페이지 제목 (예: "브랜드 정산 상세", "인플루언서 정산 상세") */
  title: string;
  /** 정산 상세 데이터 */
  settlement: SettlementDetailData;
  /** 대상 라벨 (예: "브랜드", "인플루언서") */
  targetLabel: string;
  /** 대상 이름 (예: settlement.brandName, settlement.influencerName) */
  targetName: string;
  /** 목록으로 돌아가기 핸들러 */
  onBackToList: () => void;
  /** 엑셀 다운로드 핸들러 */
  onExcelDownload: () => void;
  /** 정산 완료 핸들러 */
  onComplete: () => void;
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

/**
 * Usage:
 * <SettlementDetailContent
 *   title="브랜드 정산 상세"
 *   settlement={settlement}
 *   targetLabel="브랜드"
 *   targetName={settlement.brandName}
 *   onBackToList={handleBackToList}
 *   onExcelDownload={handleExcelDownload}
 *   onComplete={handleComplete}
 * />
 */
export function SettlementDetailContent({
  title,
  settlement,
  targetLabel,
  targetName,
  onBackToList,
  onExcelDownload,
  onComplete,
}: SettlementDetailContentProps) {
  return (
    <MajorPageLayout
      title={title}
      headerActions={
        <HeaderActions>
          <Button
            kind="neutral"
            variant="outline"
            size="medium"
            onClick={onBackToList}
          >
            <ButtonContent>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              목록으로
            </ButtonContent>
          </Button>
          <Button
            kind="neutral"
            variant="outline"
            size="medium"
            onClick={onExcelDownload}
          >
            <ButtonContent>
              <DownloadIcon className="w-4 h-4 mr-2" />
              엑셀 다운로드
            </ButtonContent>
          </Button>
          {settlement.status === 'PENDING' && (
            <Button
              kind="primary"
              variant="solid"
              size="medium"
              onClick={onComplete}
            >
              정산완료
            </Button>
          )}
        </HeaderActions>
      }
    >
      <ContentContainer>
        {/* 좌측: 캠페인별 상품 목록 */}
        <LeftSection>
          {settlement.campaignGroups.map((group) => (
            <Card key={group.campaignId}>
              <CardHeader>
                <CampaignTitle>{group.campaignName}</CampaignTitle>
                <CampaignPeriod>{group.campaignPeriod}</CampaignPeriod>
              </CardHeader>
              <TableWrapper>
                <ProductTable>
                  <TableHead>
                    <tr>
                      <TableHeaderCell $align="left">상품</TableHeaderCell>
                      <TableHeaderCell $align="left">옵션</TableHeaderCell>
                      <TableHeaderCell $align="right">수량</TableHeaderCell>
                      <TableHeaderCell $align="right">매출</TableHeaderCell>
                      <TableHeaderCell $align="right">정산금액</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <tbody>
                    {group.products.map((product, idx) => (
                      <ProductRow key={idx}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell $color="gray">
                          {product.optionName || '-'}
                        </TableCell>
                        <TableCell $align="right">{product.quantity}</TableCell>
                        <TableCell $align="right">
                          {formatPrice(product.sales)}
                        </TableCell>
                        <TableCell $align="right" $bold>
                          {formatPrice(product.settlementAmount)}
                        </TableCell>
                      </ProductRow>
                    ))}
                    <SubtotalRow>
                      <TableCell colSpan={2}>소계</TableCell>
                      <TableCell $align="right">
                        {group.subtotalQuantity}
                      </TableCell>
                      <TableCell $align="right">
                        {formatPrice(group.subtotalSales)}
                      </TableCell>
                      <TableCell $align="right">
                        {formatPrice(group.subtotalAmount)}
                      </TableCell>
                    </SubtotalRow>
                  </tbody>
                </ProductTable>
              </TableWrapper>
            </Card>
          ))}
        </LeftSection>

        {/* 우측: 정산 정보 */}
        <RightSection>
          {/* 정산 정보 카드 */}
          <Card>
            <CardContent>
              <SectionTitle>정산 정보</SectionTitle>
              <InfoList>
                <InfoRow>
                  <InfoLabel>{targetLabel}</InfoLabel>
                  <InfoValue $bold>{targetName}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>정산 기간</InfoLabel>
                  <InfoValue>
                    {settlement.periodYear}년 {settlement.periodMonth}월
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>정산 예정일</InfoLabel>
                  <InfoValue>
                    {dayjs(settlement.scheduledAt).format('YYYY.MM.DD')}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>상태</InfoLabel>
                  <StatusText $status={settlement.status}>
                    {settlement.status === 'PENDING' ? '정산대기' : '정산완료'}
                  </StatusText>
                </InfoRow>
                <hr />
                <InfoRow>
                  <InfoLabel>총 매출</InfoLabel>
                  <InfoValue>{formatPrice(settlement.totalSales)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>총 수량</InfoLabel>
                  <InfoValue>{settlement.totalQuantity}건</InfoValue>
                </InfoRow>
                <TotalRow>
                  <span>총 정산금액</span>
                  <TotalAmount>
                    {formatPrice(settlement.totalAmount)}
                  </TotalAmount>
                </TotalRow>
              </InfoList>
            </CardContent>
          </Card>

          {/* 정산 계좌 카드 */}
          <Card>
            <CardContent>
              <SectionTitle>정산 계좌</SectionTitle>
              <InfoList>
                <InfoRow>
                  <InfoLabel>은행</InfoLabel>
                  <InfoValue>
                    {settlement.bankAccount.bankName || '-'}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>계좌번호</InfoLabel>
                  <InfoValue>
                    {settlement.bankAccount.accountNumber || '-'}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>예금주</InfoLabel>
                  <InfoValue>
                    {settlement.bankAccount.accountHolder || '-'}
                  </InfoValue>
                </InfoRow>
              </InfoList>
            </CardContent>
          </Card>
        </RightSection>
      </ContentContainer>
    </MajorPageLayout>
  );
}

// Styled Components
const HeaderActions = tw.div`
  flex gap-2
`;

const ButtonContent = tw.span`
  flex items-center
`;

const ContentContainer = tw.div`
  flex gap-6
`;

const LeftSection = tw.div`
  flex-1 space-y-4
`;

const RightSection = tw.div`
  w-80 space-y-4
`;

const CardHeader = tw.div`
  p-4 border-b border-gray-200
`;

const CampaignTitle = tw.h3`
  font-semibold text-lg
`;

const CampaignPeriod = tw.p`
  text-sm text-gray-500
`;

const TableWrapper = tw.div`
  overflow-x-auto
`;

const ProductTable = tw.table`
  w-full
`;

const TableHead = tw.thead`
  bg-gray-50
`;

const TableHeaderCell = tw.th<{ $align: 'left' | 'right' }>`
  px-4 py-3
  text-sm font-medium text-gray-500
  ${({ $align }) => ($align === 'left' ? 'text-left' : 'text-right')}
`;

const ProductRow = tw.tr`
  border-b border-gray-100
`;

const SubtotalRow = tw.tr`
  bg-gray-50 font-medium
`;

const TableCell = tw.td<{
  $align?: 'left' | 'right';
  $color?: 'gray';
  $bold?: boolean;
}>`
  px-4 py-3 text-sm
  ${({ $align }) => ($align === 'right' ? 'text-right' : '')}
  ${({ $color }) => ($color === 'gray' ? 'text-gray-500' : '')}
  ${({ $bold }) => ($bold ? 'font-medium' : '')}
`;

const CardContent = tw.div`
  p-4
`;

const SectionTitle = tw.h3`
  font-semibold mb-4
`;

const InfoList = tw.div`
  space-y-3
`;

const InfoRow = tw.div`
  flex justify-between
`;

const InfoLabel = tw.span`
  text-gray-500
`;

const InfoValue = tw.span<{ $bold?: boolean }>`
  ${({ $bold }) => ($bold ? 'font-medium' : '')}
`;

const StatusText = tw.span<{ $status: string }>`
  ${({ $status }) => ($status === 'PENDING' ? 'text-orange-500' : 'text-green-500')}
`;

const TotalRow = tw.div`
  flex justify-between
  text-lg font-semibold
`;

const TotalAmount = tw.span`
  text-blue-600
`;
