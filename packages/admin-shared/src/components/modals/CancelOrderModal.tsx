/**
 * CancelOrderModal - 주문 취소 모달
 *
 * 판매자가 직접 주문을 취소할 때 취소 수수료와 사유를 입력하고
 * 환불 금액을 확인하는 모달입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { SelectDropdown } from '../base/SelectDropdown';
import {
  ButtonGroup,
  Container,
  CriticalButton,
  DialogButtonGroup,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Divider,
  Header,
  InputLabel,
  InputSection,
  InputSuffix,
  InputWrapper,
  RefundAmount,
  StyledInput,
  SummaryBox,
  SummaryLabel,
  SummaryRow,
  SummaryValue,
  Title,
} from './shared-styles';

const CANCEL_REASON_OPTIONS = [
  { value: 'CUSTOMER_REQUEST', label: '고객 요청' },
  { value: 'NO_AVAILABILITY', label: '재고 부족' },
  { value: 'PRICE_ERROR', label: '가격 오류' },
  { value: 'CUSTOM', label: '직접입력' },
];

interface CancelOrderModalProps {
  /** 상품 금액 (주문 총액) */
  productAmount: number;
  /** 기본 취소 수수료 */
  defaultCancelFee?: number;
}

interface CancelOrderResult {
  /** 확인 여부 */
  confirmed: boolean;
  /** 취소 수수료 */
  cancelFee: number;
  /** 환불 금액 */
  refundAmount: number;
  /** 취소 사유 */
  reason: string;
}

export function CancelOrderModal({
  productAmount,
  defaultCancelFee = 0,
}: CancelOrderModalProps) {
  const { resolveModal } = useCurrentModal();
  const [cancelFee, setCancelFee] = useState(defaultCancelFee);
  const [reason, setReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const refundAmount = productAmount - cancelFee;

  const handleCancelFeeChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    // 상품 금액을 초과할 수 없음
    setCancelFee(Math.min(numValue, productAmount));
  };

  const getFinalReason = (): string => {
    if (reason === 'CUSTOM') return customReason;
    return (
      CANCEL_REASON_OPTIONS.find((opt) => opt.value === reason)?.label ?? ''
    );
  };

  const handleConfirm = async () => {
    const confirmed = await openCancelOrderConfirmDialog();
    if (confirmed) {
      resolveModal({
        confirmed: true,
        cancelFee,
        refundAmount,
        reason: getFinalReason(),
      } as CancelOrderResult);
    }
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  const isConfirmDisabled =
    !reason || (reason === 'CUSTOM' && !customReason.trim());

  return (
    <Container>
      <Header>
        <Title>주문취소</Title>
      </Header>

      <InputSection>
        <InputLabel>취소 수수료</InputLabel>
        <InputWrapper>
          <StyledInput
            type="text"
            value={cancelFee.toLocaleString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleCancelFeeChange(e.target.value)
            }
            placeholder="0"
          />
          <InputSuffix>원</InputSuffix>
        </InputWrapper>
      </InputSection>

      <InputSection>
        <InputLabel>판매자 취소 사유</InputLabel>
        <SelectDropdown
          variant="form"
          options={CANCEL_REASON_OPTIONS}
          value={reason}
          onChange={setReason}
          placeholder="선택해주세요"
        />
        {reason === 'CUSTOM' && (
          <ReasonTextarea
            value={customReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCustomReason(e.target.value)
            }
            placeholder="사유를 입력해주세요"
          />
        )}
      </InputSection>

      <SummaryBox>
        <SummaryRow>
          <SummaryLabel>상품금액</SummaryLabel>
          <SummaryValue>{productAmount.toLocaleString()}원</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>취소 수수료</SummaryLabel>
          <SummaryValue>
            {cancelFee > 0 ? `-${cancelFee.toLocaleString()}` : '0'}원
          </SummaryValue>
        </SummaryRow>
        <Divider />
        <SummaryRow>
          <SummaryLabel>환불금액</SummaryLabel>
          <RefundAmount>{refundAmount.toLocaleString()}원</RefundAmount>
        </SummaryRow>
      </SummaryBox>

      <ButtonGroup>
        <Button
          kind="neutral"
          variant="solid"
          size="large"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
        >
          주문취소
        </Button>
        <Button
          kind="muted"
          variant="solid"
          size="large"
          onClick={handleCancel}
        >
          취소
        </Button>
      </ButtonGroup>
    </Container>
  );
}

/**
 * 주문 취소 최종 확인 다이얼로그
 */
function CancelOrderConfirmDialog() {
  const { resolveModal } = useCurrentModal();

  return (
    <DialogContainer>
      <DialogContent>
        <DialogTitle>주문을 취소합니다.</DialogTitle>
        <DialogDescription>취소 시 즉시 환불처리됩니다.</DialogDescription>
      </DialogContent>
      <DialogButtonGroup>
        <CriticalButton onClick={() => resolveModal(true)}>
          주문취소
        </CriticalButton>
        <Button
          kind="muted"
          variant="solid"
          size="large"
          className="w-full"
          onClick={() => resolveModal(false)}
        >
          취소
        </Button>
      </DialogButtonGroup>
    </DialogContainer>
  );
}

function openCancelOrderConfirmDialog(): Promise<boolean | null> {
  return SnappyModal.show(<CancelOrderConfirmDialog />, {
    position: 'center',
  });
}

export function openCancelOrderModal(
  props: CancelOrderModalProps,
): Promise<CancelOrderResult | null> {
  return SnappyModal.show(<CancelOrderModal {...props} />, {
    position: 'center',
  });
}

// ========================================
// Styled Components - CancelOrderModal only
// ========================================

const ReasonTextarea = tw.textarea`
  w-full
  min-h-[120px]
  p-3
  bg-white
  border
  border-[var(--stroke-neutral)]
  rounded-xl
  text-[16.5px]
  text-[var(--fg-neutral)]
  leading-[22px]
  outline-none
  resize-none
  placeholder:text-[var(--fg-placeholder)]
`;

/**
 * Usage:
 *
 * const result = await openCancelOrderModal({
 *   productAmount: 9000,
 *   defaultCancelFee: 0,
 * });
 *
 * if (result?.confirmed) {
 *   await cancelOrder({
 *     orderId,
 *     reason: result.reason,
 *     refundAmount: result.refundAmount,
 *   });
 * }
 */
