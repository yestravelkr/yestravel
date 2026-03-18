/**
 * PaymentInfoCard - 결제정보 카드 컴포넌트
 *
 * 결제수단, 상품금액, 환불, 총 주문금액 표시
 */

import tw from 'tailwind-styled-components';

import { Card } from './base/Card';
import { DescriptionList } from './base/DescriptionList';
import { formatPrice } from '../utils/format';

/** 결제 정보 타입 */
export interface PaymentInfo {
  paymentMethod: string;
  productAmount: number;
  refundAmount: number;
  totalAmount: number;
}

interface PaymentInfoCardProps {
  /** 결제 정보 */
  payment: PaymentInfo;
}

/**
 * Usage:
 * ```tsx
 * <PaymentInfoCard
 *   payment={{
 *     paymentMethod: '카드',
 *     productAmount: 20000,
 *     refundAmount: -20000,
 *     totalAmount: 6000,
 *   }}
 * />
 * ```
 */
export function PaymentInfoCard({ payment }: PaymentInfoCardProps) {
  return (
    <Card title="결제정보">
      <ContentWrapper>
        <DescriptionList
          valueAlign="right"
          items={[
            { label: '결제수단', value: payment.paymentMethod },
            { label: '상품금액', value: formatPrice(payment.productAmount) },
            ...(payment.refundAmount !== 0
              ? [
                  {
                    label: '환불',
                    value: formatPrice(payment.refundAmount),
                  },
                ]
              : []),
          ]}
        />
        <Divider />
        <TotalRow>
          <TotalLabel>총 주문금액</TotalLabel>
          <TotalValue>{formatPrice(payment.totalAmount)}</TotalValue>
        </TotalRow>
      </ContentWrapper>
    </Card>
  );
}

const ContentWrapper = tw.div`
  flex
  flex-col
  gap-5
`;

const Divider = tw.div`
  h-px
  bg-[var(--stroke-neutral)]
`;

const TotalRow = tw.div`
  flex
  items-center
  gap-2
`;

const TotalLabel = tw.span`
  w-[100px]
  shrink-0
  text-base
  leading-[22px]
  text-[var(--fg-neutral)]
`;

const TotalValue = tw.span`
  flex-1
  text-right
  text-[21px]
  font-bold
  leading-7
  text-[var(--fg-neutral)]
`;
