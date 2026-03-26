/**
 * PaymentSummarySection - 결제 요약 섹션
 *
 * 주문의 결제 정보를 요약해서 표시하는 컴포넌트입니다.
 * 숙박과 배송 타입 모두 지원하며, 다건 결제(추가결제 포함)도 표시합니다.
 *
 * Usage (단일 결제):
 * <PaymentSummarySection
 *   type="accommodation"
 *   payment={{ totalAmount: 13000, productAmount: 10000, paymentMethod: "카카오페이" }}
 * />
 *
 * Usage (다건 결제):
 * <PaymentSummarySection
 *   type="accommodation"
 *   payment={{ totalAmount: 13000, productAmount: 10000, paymentMethod: "카카오페이" }}
 *   payments={[
 *     { amount: 10000, paymentMethod: "신용카드", isAdditionalPayment: false },
 *     { amount: 3000, paymentMethod: "신용카드", isAdditionalPayment: true, additionalPaymentReason: "룸 업그레이드" },
 *   ]}
 * />
 */

import tw from 'tailwind-styled-components';

import { formatPriceExact } from '@/shared';

type OrderType = 'accommodation' | 'shipping';

interface AccommodationPayment {
  totalAmount: number;
  productAmount: number;
  paymentMethod: string;
}

interface ShippingPayment extends AccommodationPayment {
  shippingFee: number;
}

/** 개별 결제 항목 */
interface PaymentItem {
  amount: number;
  paymentMethod: string;
  isAdditionalPayment: boolean;
  additionalPaymentReason?: string | null;
}

export interface PaymentSummarySectionProps {
  type: OrderType;
  payment: AccommodationPayment | ShippingPayment;
  /** 다건 결제 배열 (추가결제 포함) */
  payments?: PaymentItem[];
}

export function PaymentSummarySection({
  payment,
  payments,
  type,
}: PaymentSummarySectionProps) {
  const isShipping = type === 'shipping';
  const shippingPayment = payment as ShippingPayment;
  const hasMultiplePayments = payments && payments.length > 1;

  const totalAmount = hasMultiplePayments
    ? payments.reduce((sum, p) => sum + p.amount, 0)
    : payment.totalAmount;

  return (
    <Section>
      <PaymentHeader>
        <PaymentTitle>총 결제금액</PaymentTitle>
        <PaymentTotal>{formatPriceExact(totalAmount)}</PaymentTotal>
      </PaymentHeader>
      <PaymentDetails>
        {hasMultiplePayments ? (
          <MultiPaymentDetails payments={payments} />
        ) : (
          <SinglePaymentDetails
            payment={payment}
            isShipping={isShipping}
            shippingFee={shippingPayment.shippingFee}
          />
        )}
      </PaymentDetails>
    </Section>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

function SinglePaymentDetails({
  payment,
  isShipping,
  shippingFee,
}: {
  payment: AccommodationPayment;
  isShipping: boolean;
  shippingFee?: number;
}) {
  return (
    <>
      <PaymentRow>
        <PaymentLabel>상품금액</PaymentLabel>
        <PaymentValue>{formatPriceExact(payment.productAmount)}</PaymentValue>
      </PaymentRow>
      {isShipping && shippingFee != null && (
        <PaymentRow>
          <PaymentLabel>배송비</PaymentLabel>
          <PaymentValue>{formatPriceExact(shippingFee)}</PaymentValue>
        </PaymentRow>
      )}
      <PaymentRow>
        <PaymentLabel>결제방법</PaymentLabel>
        <PaymentValue>{payment.paymentMethod}</PaymentValue>
      </PaymentRow>
    </>
  );
}

function MultiPaymentDetails({ payments }: { payments: PaymentItem[] }) {
  const primaryPayments = payments.filter(p => !p.isAdditionalPayment);
  const additionalPayments = payments.filter(p => p.isAdditionalPayment);

  let additionalIndex = 0;

  return (
    <>
      {primaryPayments.map((p, i) => (
        <PaymentRow key={`primary-${i}`}>
          <PaymentLabel>1차 결제</PaymentLabel>
          <PaymentValue>
            {formatPriceExact(p.amount)} ({p.paymentMethod})
          </PaymentValue>
        </PaymentRow>
      ))}
      {additionalPayments.map(p => {
        additionalIndex++;
        const label =
          additionalPayments.length > 1
            ? `추가결제 ${additionalIndex}`
            : '추가결제';

        return (
          <PaymentRow key={`additional-${additionalIndex}`}>
            <PaymentLabel>{label}</PaymentLabel>
            <PaymentValue>
              {formatPriceExact(p.amount)}
              {p.additionalPaymentReason
                ? ` (${p.additionalPaymentReason})`
                : ''}
            </PaymentValue>
          </PaymentRow>
        );
      })}
    </>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const Section = tw.section`
  bg-white
  p-5
  flex
  flex-col
  gap-5
`;

const PaymentHeader = tw.div`
  flex
  items-start
  justify-between
  gap-3
`;

const PaymentTitle = tw.h3`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const PaymentTotal = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-critical
`;

const PaymentDetails = tw.div`
  flex
  flex-col
  gap-2
`;

const PaymentRow = tw.div`
  flex
  items-center
  gap-1
  text-[15px]
  leading-5
  text-fg-muted
`;

const PaymentLabel = tw.span``;

const PaymentValue = tw.span`
  flex-1
  text-right
`;
