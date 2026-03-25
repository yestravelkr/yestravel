/**
 * AdditionalPaymentCard - 추가결제 관리 카드 컴포넌트
 *
 * 추가결제 목록 조회, 발급, 무효화, 링크 복사 기능 제공
 */

import { Button } from '@yestravelkr/min-design-system';
import { Copy, Plus } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { useAdminTrpc } from '../providers/AdminSharedContext';
import { formatPrice } from '../utils/format';
import { Card } from './base/Card';
import { openConfirmModal } from './base/ConfirmModal';
import {
  ButtonGroup,
  Container as ModalContainer,
  Header,
  InputLabel,
  InputSection,
  InputSuffix,
  InputWrapper,
  StyledInput,
  Title as ModalTitle,
} from './modals/shared-styles';

/** 추가결제 상태 */
type AdditionalPaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'DELETED';

interface AdditionalPaymentCardProps {
  /** 주문 ID */
  orderId: number;
  /** 정산 완료 여부 (influencerSettlementId || brandSettlementId 존재) */
  isSettled: boolean;
}

/**
 * Usage:
 * ```tsx
 * <AdditionalPaymentCard orderId={123} isSettled={false} />
 * ```
 */
export function AdditionalPaymentCard({
  orderId,
  isSettled,
}: AdditionalPaymentCardProps) {
  const trpc = useAdminTrpc();

  const { data: payments, refetch } =
    trpc.backofficeAdditionalPayment.findByOrderId.useQuery({ orderId });

  const cancelMutation =
    trpc.backofficeAdditionalPayment.cancel.useMutation({
      onSuccess: () => {
        toast.success('추가결제가 무효화되었습니다.');
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || '무효화에 실패했습니다.');
      },
    });

  const handleCreate = async () => {
    const result = await openCreateModal({ orderId });
    if (!result) return;
    refetch();
  };

  const handleCancel = async (additionalPaymentId: number) => {
    const confirmed = await openConfirmModal({
      title: '추가결제를 무효화하시겠습니까?',
      description: '무효화된 링크는 더 이상 사용할 수 없습니다.',
      confirmText: '무효화',
    });

    if (!confirmed) return;
    cancelMutation.mutate({ additionalPaymentId });
  };

  const handleCopyLink = (paymentUrl: string) => {
    navigator.clipboard
      .writeText(paymentUrl)
      .then(() => toast.success('링크가 복사되었습니다.'))
      .catch(() => toast.error('링크 복사에 실패했습니다.'));
  };

  const hasPayments = payments && payments.length > 0;

  return (
    <Card title="추가결제">
      <ContentWrapper>
        {hasPayments ? (
          <PaymentList>
            {payments.map((payment) => (
              <PaymentItem key={payment.id}>
                <PaymentHeader>
                  <PaymentTitle>{payment.title}</PaymentTitle>
                  <StatusBadge $status={payment.status}>
                    {STATUS_LABEL[payment.status]}
                  </StatusBadge>
                </PaymentHeader>
                <PaymentDetail>
                  <PaymentAmount>
                    {formatPrice(payment.amount)}
                  </PaymentAmount>
                  <PaymentReason>{payment.reason}</PaymentReason>
                </PaymentDetail>
                {payment.status === 'PENDING' && payment.paymentUrl && (
                  <PaymentActions>
                    <Button
                      kind="neutral"
                      variant="outline"
                      size="small"
                      onClick={() => handleCopyLink(payment.paymentUrl!)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      링크 복사
                    </Button>
                    <Button
                      kind="muted"
                      variant="outline"
                      size="small"
                      onClick={() => handleCancel(payment.id)}
                    >
                      무효화
                    </Button>
                  </PaymentActions>
                )}
              </PaymentItem>
            ))}
          </PaymentList>
        ) : (
          <EmptyMessage>추가결제 내역이 없습니다.</EmptyMessage>
        )}
        <Button
          kind="neutral"
          variant="outline"
          size="medium"
          onClick={handleCreate}
          disabled={isSettled}
        >
          <Plus className="w-4 h-4" />
          추가결제 발급
        </Button>
      </ContentWrapper>
    </Card>
  );
}

// ========================================
// Constants
// ========================================

const STATUS_LABEL: Record<AdditionalPaymentStatus, string> = {
  PENDING: '대기중',
  PAID: '결제완료',
  EXPIRED: '만료',
  DELETED: '무효',
};

const STATUS_COLORS: Record<AdditionalPaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  DELETED: 'bg-red-100 text-red-600',
};

// ========================================
// Create Additional Payment Modal
// ========================================

interface CreateModalProps {
  orderId: number;
}

interface CreateModalResult {
  paymentUrl: string;
}

function CreateAdditionalPaymentModal({ orderId }: CreateModalProps) {
  const trpc = useAdminTrpc();
  const { resolveModal } = useCurrentModal();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const createMutation =
    trpc.backofficeAdditionalPayment.create.useMutation({
      onSuccess: (data) => {
        setCreatedUrl(data.paymentUrl);
        toast.success('추가결제 링크가 생성되었습니다.');
      },
      onError: (error) => {
        toast.error(error.message || '추가결제 생성에 실패했습니다.');
      },
    });

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const isValid =
    title.trim().length > 0 &&
    numericAmount >= 1000 &&
    reason.trim().length > 0;

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    setAmount(numeric ? parseInt(numeric, 10).toLocaleString() : '');
  };

  const handleSubmit = () => {
    if (!isValid) return;
    createMutation.mutate({
      orderId,
      title: title.trim(),
      amount: numericAmount,
      reason: reason.trim(),
    });
  };

  const handleCopyUrl = () => {
    if (!createdUrl) return;
    navigator.clipboard
      .writeText(createdUrl)
      .then(() => toast.success('링크가 복사되었습니다.'))
      .catch(() => toast.error('링크 복사에 실패했습니다.'));
  };

  const handleClose = () => {
    resolveModal(createdUrl ? { paymentUrl: createdUrl } : null);
  };

  // 생성 완료 후 결과 표시
  if (createdUrl) {
    return (
      <ModalContainer>
        <Header>
          <ModalTitle>추가결제 링크 생성 완료</ModalTitle>
        </Header>
        <UrlSection>
          <InputLabel>결제 링크</InputLabel>
          <UrlBox>
            <UrlText>{createdUrl}</UrlText>
          </UrlBox>
        </UrlSection>
        <ButtonGroup>
          <Button
            kind="neutral"
            variant="solid"
            size="large"
            onClick={handleCopyUrl}
          >
            <Copy className="w-4 h-4" />
            링크 복사
          </Button>
          <Button
            kind="muted"
            variant="solid"
            size="large"
            onClick={handleClose}
          >
            닫기
          </Button>
        </ButtonGroup>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer>
      <Header>
        <ModalTitle>추가결제 발급</ModalTitle>
      </Header>

      <InputSection>
        <InputLabel>결제 창 제목</InputLabel>
        <InputWrapper>
          <StyledInput
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="예: 객실 업그레이드 추가금"
          />
        </InputWrapper>
      </InputSection>

      <InputSection>
        <InputLabel>금액 (최소 1,000원)</InputLabel>
        <InputWrapper>
          <StyledInput
            type="text"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleAmountChange(e.target.value)
            }
            placeholder="0"
          />
          <InputSuffix>원</InputSuffix>
        </InputWrapper>
      </InputSection>

      <InputSection>
        <InputLabel>사유</InputLabel>
        <ReasonTextarea
          value={reason}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setReason(e.target.value)
          }
          placeholder="추가결제 사유를 입력해주세요"
        />
      </InputSection>

      <ButtonGroup>
        <Button
          kind="neutral"
          variant="solid"
          size="large"
          onClick={handleSubmit}
          disabled={!isValid || createMutation.isPending}
        >
          발급하기
        </Button>
        <Button
          kind="muted"
          variant="solid"
          size="large"
          onClick={handleClose}
        >
          취소
        </Button>
      </ButtonGroup>
    </ModalContainer>
  );
}

function openCreateModal(
  props: CreateModalProps,
): Promise<CreateModalResult | null> {
  return SnappyModal.show(<CreateAdditionalPaymentModal {...props} />, {
    position: 'center',
  });
}

// ========================================
// Styled Components
// ========================================

const ContentWrapper = tw.div`
  flex flex-col gap-4
`;

const PaymentList = tw.div`
  flex flex-col gap-3
`;

const PaymentItem = tw.div`
  flex flex-col gap-2
  p-3
  bg-[var(--bg-neutral,#F5F5F5)]
  rounded-xl
`;

const PaymentHeader = tw.div`
  flex items-center justify-between
`;

const PaymentTitle = tw.span`
  text-[15px] font-medium
  text-[var(--fg-neutral)]
  leading-5
`;

const StatusBadge = tw.span<{ $status: AdditionalPaymentStatus }>`
  px-2 py-0.5
  rounded-full
  text-xs font-medium
  leading-4
  ${(p: { $status: AdditionalPaymentStatus }) => STATUS_COLORS[p.$status]}
`;

const PaymentDetail = tw.div`
  flex flex-col gap-1
`;

const PaymentAmount = tw.span`
  text-base font-bold
  text-[var(--fg-neutral)]
  leading-[22px]
`;

const PaymentReason = tw.span`
  text-[13px]
  text-[var(--fg-muted)]
  leading-[18px]
`;

const PaymentActions = tw.div`
  flex gap-2
`;

const EmptyMessage = tw.p`
  text-[15px]
  text-[var(--fg-muted)]
  leading-5
`;

const UrlSection = tw.div`
  flex flex-col gap-2
`;

const UrlBox = tw.div`
  p-3
  bg-[var(--bg-neutral,#F5F5F5)]
  rounded-xl
  break-all
`;

const UrlText = tw.span`
  text-[13px]
  text-[var(--fg-neutral)]
  leading-[18px]
`;

const ReasonTextarea = tw.textarea`
  w-full
  min-h-[100px]
  p-3
  bg-white
  border border-[var(--stroke-neutral)]
  rounded-xl
  text-[16.5px]
  text-[var(--fg-neutral)]
  leading-[22px]
  outline-none
  resize-none
  placeholder:text-[var(--fg-placeholder)]
`;
