/**
 * PaymentSummarySection - 결제 요약 섹션
 *
 * 주문의 결제 정보를 요약해서 표시하는 컴포넌트입니다.
 * 숙박과 배송 타입 모두 지원합니다.
 *
 * Usage (숙박):
 * <PaymentSummarySection
 *   type="accommodation"
 *   payment={{
 *     totalAmount: 13000,
 *     productAmount: 10000,
 *     paymentMethod: "카카오페이"
 *   }}
 * />
 *
 * Usage (배송):
 * <PaymentSummarySection
 *   type="shipping"
 *   payment={{
 *     totalAmount: 13000,
 *     productAmount: 10000,
 *     shippingFee: 3000,
 *     paymentMethod: "카카오페이"
 *   }}
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

export interface PaymentSummarySectionProps {
  type: OrderType;
  payment: AccommodationPayment | ShippingPayment;
}

export function PaymentSummarySection({
  payment,
  type,
}: PaymentSummarySectionProps) {
  const isShipping = type === 'shipping';
  const shippingPayment = payment as ShippingPayment;

  return (
    <Section>
      <PaymentHeader>
        <PaymentTitle>총 결제금액</PaymentTitle>
        <PaymentTotal>{formatPriceExact(payment.totalAmount)}</PaymentTotal>
      </PaymentHeader>
      <PaymentDetails>
        <PaymentRow>
          <PaymentLabel>상품금액</PaymentLabel>
          <PaymentValue>{formatPriceExact(payment.productAmount)}</PaymentValue>
        </PaymentRow>
        {isShipping && (
          <PaymentRow>
            <PaymentLabel>배송비</PaymentLabel>
            <PaymentValue>
              {formatPriceExact(shippingPayment.shippingFee)}
            </PaymentValue>
          </PaymentRow>
        )}
        <PaymentRow>
          <PaymentLabel>결제방법</PaymentLabel>
          <PaymentValue>{payment.paymentMethod}</PaymentValue>
        </PaymentRow>
      </PaymentDetails>
    </Section>
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
