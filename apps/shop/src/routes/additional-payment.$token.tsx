/**
 * AdditionalPaymentPage - 추가결제 결제 페이지
 *
 * 고객이 추가결제 링크로 접속하여 결제하는 페이지입니다.
 * 인증 불필요 (_auth 바깥에 위치).
 *
 * Usage:
 * - /additional-payment/{token} (추가결제 링크)
 */

import type { PaymentRequest } from '@portone/browser-sdk/v2';
import * as PortOne from '@portone/browser-sdk/v2';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { API_BASEURL } from '@/constants';
import { trpc } from '@/shared';
import { formatPriceExact } from '@/shared';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/additional-payment/$token')({
  component: AdditionalPaymentPage,
});

// ============================================================================
// Types
// ============================================================================

type AdditionalPaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'DELETED';

// ============================================================================
// Main Component
// ============================================================================

function AdditionalPaymentPage() {
  const { token } = Route.useParams();

  return (
    <Suspense fallback={<AdditionalPaymentSkeleton />}>
      <AdditionalPaymentContent token={token} />
    </Suspense>
  );
}

function AdditionalPaymentContent({ token }: { token: string }) {
  const [data] = trpc.shopAdditionalPayment.getByToken.useSuspenseQuery({
    token,
  });

  const status = data.status as AdditionalPaymentStatus;

  if (status === 'PAID') {
    return <CompletedView />;
  }

  if (status === 'EXPIRED') {
    return <ExpiredView />;
  }

  if (status === 'DELETED') {
    return <DeletedView />;
  }

  return <PendingPaymentView data={data} token={token} />;
}

// ============================================================================
// Pending Payment View (PENDING status)
// ============================================================================

interface PendingPaymentData {
  id: number;
  token: string;
  title: string;
  amount: number;
  reason: string;
  orderNumber: string;
  productName: string;
  customerName: string;
  customerPhone: string;
}

function PendingPaymentView({
  data,
  token,
}: {
  data: PendingPaymentData;
  token: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const completeMutation = trpc.shopAdditionalPayment.complete.useMutation({
    onSuccess: () => {
      setIsCompleted(true);
    },
    onError: error => {
      toast.error(error.message || '결제 완료 처리에 실패했습니다.');
      setIsSubmitting(false);
    },
  });

  if (isCompleted) {
    return <CompletedView />;
  }

  const handlePayment = () => {
    setIsSubmitting(true);

    const paymentId = `ADDPAY-${data.id}-${Date.now()}`;

    const paymentRequest: PaymentRequest = {
      storeId: 'store-225e8f7c-301b-421e-bd54-189066bbb97e',
      channelKey: 'channel-key-be836e0a-6537-4a86-bf9d-f99211e0be6c',
      paymentId,
      orderName: `YesTravel - ${data.title}`,
      totalAmount: data.amount,
      currency: 'KRW',
      payMethod: 'CARD',
      customer: {
        customerId: data.orderNumber,
        fullName: data.customerName,
        phoneNumber: data.customerPhone,
        email: 'info@yestravel.co.kr',
      },
      redirectUrl: `${API_BASEURL}/payment/complete-redirect?origin=${window.location.origin}`,
    };

    PortOne.requestPayment(paymentRequest)
      .then(response => {
        if (!response || response.code === 'FAILURE_TYPE_PG') {
          toast.error('결제가 실패했습니다.');
          setIsSubmitting(false);
          return;
        }

        completeMutation.mutate({
          token,
          paymentId: response.paymentId ?? paymentId,
          paymentToken: response.paymentToken ?? '',
          txId: response.txId ?? '',
        });
      })
      .catch(error => {
        console.error('결제 오류:', error);
        toast.error('결제 중 오류가 발생했습니다.');
        setIsSubmitting(false);
      });
  };

  return (
    <Container>
      <ContentWrapper>
        <Section>
          <PageTitle>추가결제</PageTitle>
          <PageSubtitle>{data.title}</PageSubtitle>
        </Section>

        <Section>
          <InfoRow>
            <InfoLabel>상품명</InfoLabel>
            <InfoValue>{data.productName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>주문번호</InfoLabel>
            <InfoValue>{data.orderNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>사유</InfoLabel>
            <InfoValue>{data.reason}</InfoValue>
          </InfoRow>
          <AmountRow>
            <AmountLabel>추가결제 금액</AmountLabel>
            <AmountValue>{formatPriceExact(data.amount)}</AmountValue>
          </AmountRow>
        </Section>
      </ContentWrapper>

      <FooterContainer>
        <PaymentButton onClick={handlePayment} disabled={isSubmitting}>
          {isSubmitting
            ? '결제 진행 중...'
            : `${formatPriceExact(data.amount)} 결제하기`}
        </PaymentButton>
      </FooterContainer>
    </Container>
  );
}

// ============================================================================
// Status Views (PAID, EXPIRED, DELETED)
// ============================================================================

function CompletedView() {
  return (
    <Container>
      <StatusContainer>
        <StatusIcon>&#10003;</StatusIcon>
        <StatusTitle>결제가 완료되었습니다</StatusTitle>
        <StatusDescription>
          추가결제가 정상적으로 처리되었습니다.
        </StatusDescription>
      </StatusContainer>
    </Container>
  );
}

function ExpiredView() {
  return (
    <Container>
      <StatusContainer>
        <StatusTitle>결제 링크가 만료되었습니다</StatusTitle>
        <StatusDescription>
          유효기간이 지난 결제 링크입니다. 고객센터에 문의해주세요.
        </StatusDescription>
      </StatusContainer>
    </Container>
  );
}

function DeletedView() {
  return (
    <Container>
      <StatusContainer>
        <StatusTitle>무효화된 결제 링크입니다</StatusTitle>
        <StatusDescription>
          해당 추가결제가 취소되었습니다. 고객센터에 문의해주세요.
        </StatusDescription>
      </StatusContainer>
    </Container>
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

function AdditionalPaymentSkeleton() {
  return (
    <Container>
      <ContentWrapper>
        <Section>
          <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </Section>
        <Section>
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </Section>
      </ContentWrapper>
    </Container>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const Container = tw.div`
  min-h-screen
  bg-bg-layer-base
  max-w-[600px]
  mx-auto
  flex
  flex-col
`;

const ContentWrapper = tw.div`
  flex-1
  flex
  flex-col
  gap-2
`;

const Section = tw.section`
  bg-white
  p-5
  flex
  flex-col
  gap-4
`;

const PageTitle = tw.h1`
  text-[21px]
  font-bold
  leading-7
  text-fg-neutral
`;

const PageSubtitle = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const InfoRow = tw.div`
  flex
  items-start
  justify-between
  gap-3
  text-[15px]
  leading-5
`;

const InfoLabel = tw.span`
  text-fg-muted
  shrink-0
`;

const InfoValue = tw.span`
  text-fg-neutral
  text-right
`;

const AmountRow = tw.div`
  flex
  items-center
  justify-between
  gap-3
  pt-4
  border-t
  border-[var(--stroke-neutral)]
`;

const AmountLabel = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const AmountValue = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-critical
`;

const FooterContainer = tw.div`
  bg-white
  p-5
  pb-8
`;

const PaymentButton = tw.button`
  w-full
  h-[52px]
  bg-bg-neutral-solid
  text-fg-on-surface
  rounded-xl
  flex
  items-center
  justify-center
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:opacity-90
  transition-opacity
  disabled:opacity-50
`;

const StatusContainer = tw.div`
  flex-1
  flex
  flex-col
  items-center
  justify-center
  gap-3
  p-5
`;

const StatusIcon = tw.div`
  w-16
  h-16
  rounded-full
  bg-green-100
  text-green-600
  flex
  items-center
  justify-center
  text-3xl
  font-bold
  mb-2
`;

const StatusTitle = tw.h1`
  text-[21px]
  font-bold
  leading-7
  text-fg-neutral
  text-center
`;

const StatusDescription = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
  text-center
`;
