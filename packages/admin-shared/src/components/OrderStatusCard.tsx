/**
 * OrderStatusCard - 주문 상태 카드 컴포넌트
 *
 * 상태 정보, 주문 아이템 테이블, 액션 버튼 포함
 * capabilities prop으로 액션 버튼 표시를 제어할 수 있습니다.
 */

import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
} from '@floating-ui/react';
import { Button } from '@yestravelkr/min-design-system';
import { ChevronDown, Undo2, X } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { formatPriceRaw } from '../utils/format';
import type { OrderCapabilities } from '../types/order.types';

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
  /** 예약확정/주문확인 핸들러 */
  onConfirm?: () => void;
  /** 이전 상태로 되돌리기 핸들러 */
  onRevertStatus?: () => void;
  /** 주문 취소 핸들러 */
  onCancelOrder?: () => void;
  /** 주문 히스토리 핸들러 */
  onHistory?: () => void;
  /** 취소승인 핸들러 */
  onCancelApprove?: () => void;
  /** 취소거절 핸들러 */
  onCancelReject?: () => void;
  /** 기능 제어 (미지정 시 모든 기능 표시) */
  capabilities?: OrderCapabilities;
}

/**
 * Usage:
 * ```tsx
 * <OrderStatusCard
 *   status="PAID"
 *   statusLabel="결제완료"
 *   statusDate="25.01.01 13:00"
 *   items={orderItems}
 *   onConfirm={() => {}}
 *   capabilities={{ canConfirm: true, canViewHistory: true }}
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
  onRevertStatus,
  onCancelOrder,
  onHistory,
  onCancelApprove,
  onCancelReject,
  capabilities,
}: OrderStatusCardProps) {
  const canConfirm = capabilities?.canConfirm ?? true;
  const canRevertStatus = capabilities?.canRevertStatus ?? true;
  const canCancelOrder = capabilities?.canCancelOrder ?? true;
  const canApproveCancel = capabilities?.canApproveCancel ?? true;
  const canViewHistory = capabilities?.canViewHistory ?? true;

  const showManageDropdown = canRevertStatus || canCancelOrder;

  const renderActions = () => {
    switch (status) {
      case 'PAID':
        return (
          <>
            {canConfirm && (
              <Button
                kind="neutral"
                variant="solid"
                size="large"
                onClick={onConfirm}
              >
                주문확인
              </Button>
            )}
            {showManageDropdown && (
              <ManageDropdown
                status={status}
                onRevertStatus={canRevertStatus ? onRevertStatus : undefined}
                onCancelOrder={canCancelOrder ? onCancelOrder : undefined}
              />
            )}
          </>
        );
      case 'PENDING_RESERVATION':
        return (
          <>
            {canConfirm && (
              <Button
                kind="neutral"
                variant="solid"
                size="large"
                onClick={onConfirm}
              >
                예약확정
              </Button>
            )}
            {showManageDropdown && (
              <ManageDropdown
                status={status}
                onRevertStatus={canRevertStatus ? onRevertStatus : undefined}
                onCancelOrder={canCancelOrder ? onCancelOrder : undefined}
              />
            )}
          </>
        );
      case 'RESERVATION_CONFIRMED':
      case 'COMPLETED':
        return showManageDropdown ? (
          <ManageDropdown
            status={status}
            onRevertStatus={canRevertStatus ? onRevertStatus : undefined}
            onCancelOrder={canCancelOrder ? onCancelOrder : undefined}
          />
        ) : null;
      case 'CANCEL_REQUESTED':
        return canApproveCancel ? (
          <>
            <Button
              kind="neutral"
              variant="solid"
              size="large"
              onClick={onCancelApprove}
            >
              취소승인
            </Button>
            <GrayButton onClick={onCancelReject}>취소거절</GrayButton>
          </>
        ) : null;
      default:
        return null;
    }
  };

  const actions = renderActions();

  return (
    <Container>
      <ContentSection>
        <Header>
          <HeaderLeft>
            <StatusTitle>{statusLabel}</StatusTitle>
            <StatusDate>{statusDate}</StatusDate>
          </HeaderLeft>
          {canViewHistory && (
            <Button
              kind="neutral"
              variant="outline"
              size="small"
              onClick={onHistory}
            >
              주문 히스토리
            </Button>
          )}
        </Header>

        {status === 'CANCEL_REQUESTED' && cancelReason && (
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
                  {formatPriceRaw(item.amount)}
                </DataCell>
              </TableRow>
            ))}
          </TableBody>
        </ItemTable>

        {actions && <Actions>{actions}</Actions>}
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

/** 주문관리 드롭다운 메뉴 */
function ManageDropdown({
  status,
  onRevertStatus,
  onCancelOrder,
}: {
  status: string;
  onRevertStatus?: () => void;
  onCancelOrder?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const revertLabel =
    status === 'PENDING_RESERVATION'
      ? '결제 완료 상태로 변경'
      : status === 'RESERVATION_CONFIRMED'
        ? '예약 대기 상태로 변경'
        : null;

  return (
    <>
      <ManageButton
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
      >
        주문관리
        <ChevronDown size={22} />
      </ManageButton>

      {isOpen && (
        <FloatingPortal>
          <DropdownMenu
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {revertLabel && onRevertStatus && (
              <>
                <MenuItem
                  type="button"
                  onClick={() => {
                    onRevertStatus();
                    setIsOpen(false);
                  }}
                >
                  <Undo2 size={16} />
                  {revertLabel}
                </MenuItem>
                <MenuDivider />
              </>
            )}
            {onCancelOrder && (
              <MenuItem
                type="button"
                $danger
                onClick={() => {
                  onCancelOrder();
                  setIsOpen(false);
                }}
              >
                <X size={16} />
                주문 취소
              </MenuItem>
            )}
          </DropdownMenu>
        </FloatingPortal>
      )}
    </>
  );
}

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

const DropdownMenu = tw.div`
  z-50
  w-[240px]
  p-2
  bg-white
  rounded-[20px]
  shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.12)]
`;

const MenuItem = tw.button<{ $danger?: boolean }>`
  flex
  items-center
  gap-2
  w-full
  h-9
  px-3
  rounded-xl
  text-[15px]
  leading-5
  text-left
  cursor-pointer
  transition-colors
  hover:bg-[var(--bg-neutral,#f4f4f5)]
  ${({ $danger }) =>
    $danger
      ? 'text-[var(--fg-critical,#eb3d3d)]'
      : 'text-[var(--fg-neutral,#18181b)]'}
`;

const MenuDivider = tw.div`
  h-px
  mx-2
  my-1
  bg-[var(--stroke-neutral-subtle,#e4e4e7)]
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
