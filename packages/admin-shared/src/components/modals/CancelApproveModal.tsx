/**
 * CancelApproveModal - 취소 승인 모달
 *
 * 주문 취소 승인 시 취소 수수료를 입력하고 환불 금액을 확인하는 모달입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';

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

interface CancelApproveModalProps {
  /** 상품 금액 (주문 총액) */
  productAmount: number;
  /** 기본 취소 수수료 */
  defaultCancelFee?: number;
}

interface CancelApproveResult {
  /** 확인 여부 */
  confirmed: boolean;
  /** 취소 수수료 */
  cancelFee: number;
  /** 환불 금액 */
  refundAmount: number;
}

export function CancelApproveModal({
  productAmount,
  defaultCancelFee = 0,
}: CancelApproveModalProps) {
  const { resolveModal } = useCurrentModal();
  const [cancelFee, setCancelFee] = useState(defaultCancelFee);

  const refundAmount = productAmount - cancelFee;

  const handleCancelFeeChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    // 상품 금액을 초과할 수 없음
    setCancelFee(Math.min(numValue, productAmount));
  };

  const handleConfirm = async () => {
    // 최종 확인 다이얼로그 표시
    const confirmed = await openCancelConfirmDialog();
    if (confirmed) {
      resolveModal({
        confirmed: true,
        cancelFee,
        refundAmount,
      } as CancelApproveResult);
    }
  };

  const handleCancel = () => {
    resolveModal(null);
  };

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
 * 취소 승인 최종 확인 다이얼로그
 */
function CancelConfirmDialog() {
  const { resolveModal } = useCurrentModal();

  return (
    <DialogContainer>
      <DialogContent>
        <DialogTitle>취소요청을 승인합니다.</DialogTitle>
        <DialogDescription>취소승인시 즉시 환불처리됩니다.</DialogDescription>
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

function openCancelConfirmDialog(): Promise<boolean | null> {
  return SnappyModal.show(<CancelConfirmDialog />, {
    position: 'center',
  });
}

export function openCancelApproveModal(
  props: CancelApproveModalProps,
): Promise<CancelApproveResult | null> {
  return SnappyModal.show(<CancelApproveModal {...props} />, {
    position: 'center',
  });
}

/**
 * Usage:
 *
 * const result = await openCancelApproveModal({
 *   productAmount: 9000,
 *   defaultCancelFee: 0,
 * });
 *
 * if (result?.confirmed) {
 *   // 취소 승인 API 호출
 *   await approveClaim({
 *     orderId,
 *     cancelFee: result.cancelFee,
 *     refundAmount: result.refundAmount,
 *   });
 * }
 */
