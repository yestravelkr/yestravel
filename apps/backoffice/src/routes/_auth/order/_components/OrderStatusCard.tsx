/**
 * OrderStatusCard - 주문 상태 카드 컴포넌트
 *
 * 상태 정보, 주문 아이템 테이블, 액션 버튼 포함
 */

import { Button } from '@yestravelkr/min-design-system';
import { ChevronDown } from 'lucide-react';
import tw from 'tailwind-styled-components';

/** 주문 아이템 타입 */
export interface OrderItem {
  id: number;
  productName: string;
  optionName: string;
  checkInDate: string;
  checkOutDate: string;
  amount: number;
}

interface OrderStatusCardProps {
  /** 주문 상태 */
  status: string;
  /** 상태 라벨 */
  statusLabel: string;
  /** 상태 날짜 */
  statusDate: string;
  /** 주문 아이템 목록 */
  items: OrderItem[];
  /** 취소 사유 (취소요청 상태일 때) */
  cancelReason?: string | null;
  /** 예약확정 핸들러 */
  onConfirm?: () => void;
  /** 주문관리 핸들러 */
  onManage?: () => void;
  /** 주문 히스토리 핸들러 */
  onHistory?: () => void;
  /** 취소승인 핸들러 */
  onCancelApprove?: () => void;
  /** 취소거절 핸들러 */
  onCancelReject?: () => void;
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount);

/**
 * Usage:
 * ```tsx
 * <OrderStatusCard
 *   status="PAID"
 *   statusLabel="결제완료"
 *   statusDate="25.01.01 13:00"
 *   items={orderItems}
 *   onConfirm={() => {}}
 *   onManage={() => {}}
 * />
 * ```
 */
export function OrderStatusCard({
  status,
  statusLabel,
  statusDate,
  items,
  cancelReason,
  onConfirm,
  onManage,
  onHistory,
  onCancelApprove,
  onCancelReject,
}: OrderStatusCardProps) {
  const isCancelRequested = status === 'CANCEL_REQUESTED';
  return (
    <Container>
      <ContentSection>
        <Header>
          <HeaderLeft>
            <StatusTitle>{statusLabel}</StatusTitle>
            <StatusDate>{statusDate}</StatusDate>
          </HeaderLeft>
          <Button
            kind="neutral"
            variant="outline"
            size="small"
            onClick={onHistory}
          >
            주문 히스토리
          </Button>
        </Header>

        {isCancelRequested && cancelReason && (
          <CancelReasonSection>
            <CancelReasonLabel>취소사유</CancelReasonLabel>
            <CancelReasonText>{cancelReason}</CancelReasonText>
          </CancelReasonSection>
        )}

        <ItemTable>
          <TableHeader>
            <HeaderCell $flex>상품</HeaderCell>
            <HeaderCell style={{ width: 200 }}>옵션</HeaderCell>
            <HeaderCell style={{ width: 180 }}>이용일</HeaderCell>
            <HeaderCell style={{ width: 100 }}>상품금액</HeaderCell>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <DataCell $flex>{item.productName}</DataCell>
                <DataCell style={{ width: 200 }}>{item.optionName}</DataCell>
                <DataCell style={{ width: 180 }}>
                  {item.checkInDate} ~ {item.checkOutDate}
                </DataCell>
                <DataCell style={{ width: 100 }}>
                  {formatPrice(item.amount)}
                </DataCell>
              </TableRow>
            ))}
          </TableBody>
        </ItemTable>

        <Actions>
          {isCancelRequested ? (
            <>
              <Button
                kind="neutral"
                variant="solid"
                size="medium"
                onClick={onCancelApprove}
              >
                취소승인
              </Button>
              <GrayButton onClick={onCancelReject}>취소거절</GrayButton>
            </>
          ) : (
            <>
              <Button
                kind="neutral"
                variant="solid"
                size="medium"
                onClick={onConfirm}
              >
                예약확정
              </Button>
              <ManageButton onClick={onManage}>
                주문관리
                <ChevronDown size={22} />
              </ManageButton>
            </>
          )}
        </Actions>
      </ContentSection>
    </Container>
  );
}

const Container = tw.div`
  bg-[var(--bg-layer,#FFF)]
  rounded-[20px]
  overflow-hidden
`;

const ContentSection = tw.div`
  p-5
  flex
  flex-col
  gap-5
`;

const Header = tw.div`
  flex
  items-center
  justify-between
`;

const HeaderLeft = tw.div`
  flex
  flex-col
`;

const StatusTitle = tw.h2`
  text-[21px]
  font-bold
  leading-7
  text-[var(--fg-neutral)]
`;

const StatusDate = tw.span`
  text-[13.5px]
  leading-[18px]
  text-[var(--fg-muted)]
`;

const ItemTable = tw.div`
  w-full
  bg-[var(--stroke-neutral-subtle)]
  flex
  flex-col
  gap-px
  overflow-x-auto
`;

const TableHeader = tw.div`
  flex
  gap-px
  bg-[var(--bg-layer,#FFF)]
  border-b
  border-[var(--stroke-neutral)]
  min-w-[600px]
`;

const HeaderCell = tw.div<{ $flex?: boolean }>`
  h-9
  px-2
  flex
  items-center
  text-[15px]
  leading-5
  text-[var(--fg-muted)]
  bg-[var(--bg-field,#FFF)]
  shrink-0
  ${(p) => (p.$flex ? 'flex-1' : '')}
`;

const TableBody = tw.div`
  flex
  flex-col
  gap-px
`;

const TableRow = tw.div`
  flex
  gap-px
  bg-[var(--bg-layer,#FFF)]
  min-w-[600px]
`;

const DataCell = tw.div<{ $flex?: boolean }>`
  min-h-[44px]
  px-2
  py-3
  flex
  items-start
  text-[15px]
  leading-5
  text-[var(--fg-neutral)]
  bg-[var(--bg-field,#FFF)]
  shrink-0
  ${(p) => (p.$flex ? 'flex-1' : '')}
`;

const Actions = tw.div`
  flex
  gap-2
`;

const ManageButton = tw.button`
  flex
  items-center
  justify-center
  gap-1
  h-11
  min-w-11
  px-3
  rounded-xl
  bg-[var(--bg-neutral)]
  text-[var(--fg-neutral)]
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:bg-[var(--bg-neutral-subtle)]
  transition-colors
`;

const GrayButton = tw.button`
  flex
  items-center
  justify-center
  h-11
  min-w-11
  px-3
  rounded-xl
  bg-[var(--bg-neutral)]
  text-[var(--fg-neutral)]
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:bg-[var(--bg-neutral-subtle)]
  transition-colors
`;

const CancelReasonSection = tw.div`
  flex
  items-center
  gap-2
  px-5
  py-5
  bg-[var(--bg-neutral)]
  rounded-xl
`;

const CancelReasonLabel = tw.span`
  text-[15px]
  leading-5
  text-[var(--fg-neutral)]
  w-[100px]
  shrink-0
`;

const CancelReasonText = tw.span`
  text-[15px]
  leading-5
  text-[var(--fg-neutral)]
`;
