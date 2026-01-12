/**
 * PaymentAmountSection - 총 결제금액 섹션
 *
 * 상품금액과 총 결제금액을 표시합니다.
 */

import tw from 'tailwind-styled-components';

export interface PaymentAmountSectionProps {
  productAmount: number;
  totalAmount: number;
}

export function PaymentAmountSection({
  productAmount,
  totalAmount,
}: PaymentAmountSectionProps) {
  return (
    <Section>
      <TotalRow>
        <TotalLabel>총 결제금액</TotalLabel>
        <TotalValue>{totalAmount.toLocaleString()}원</TotalValue>
      </TotalRow>

      <DetailList>
        <DetailRow>
          <DetailLabel>상품금액</DetailLabel>
          <DetailValue>{productAmount.toLocaleString()}원</DetailValue>
        </DetailRow>
      </DetailList>
    </Section>
  );
}

const Section = tw.section`
  p-5
  bg-white
  flex
  flex-col
  gap-5
`;

const TotalRow = tw.div`
  flex
  items-start
  gap-3
`;

const TotalLabel = tw.span`
  text-fg-neutral
  text-lg
  font-bold
  leading-6
`;

const TotalValue = tw.span`
  flex-1
  text-right
  text-fg-critical
  text-lg
  font-bold
  leading-6
`;

const DetailList = tw.div`
  flex
  flex-col
  gap-2
`;

const DetailRow = tw.div`
  flex
  items-center
  gap-1
`;

const DetailLabel = tw.span`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const DetailValue = tw.span`
  flex-1
  text-right
  text-fg-muted
  text-base
  font-normal
  leading-5
`;
