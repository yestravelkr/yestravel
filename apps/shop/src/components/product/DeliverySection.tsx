/**
 * DeliverySection - 배송비 정보 섹션
 *
 * 배송비, 무료배송 조건, 예상 발송일 등을 표시합니다.
 */

import { Truck } from 'lucide-react';
import tw from 'tailwind-styled-components';

export interface DeliverySectionProps {
  /** 배송비 (원) */
  deliveryFee: number;
  /** 무료배송 조건 금액 (원) - 없으면 null */
  freeDeliveryThreshold?: number | null;
  /** 예상 발송일 텍스트 */
  estimatedDelivery?: string;
}

export function DeliverySection({
  deliveryFee,
  freeDeliveryThreshold,
  estimatedDelivery,
}: DeliverySectionProps) {
  return (
    <Container>
      <Divider />
      <Content>
        <IconWrapper>
          <Truck size={18} />
        </IconWrapper>
        <Info>
          <DeliveryRow>
            <DeliveryFee>배송비 {deliveryFee.toLocaleString()}원</DeliveryFee>
            {freeDeliveryThreshold && (
              <>
                <Dot>·</Dot>
                <FreeDeliveryInfo>
                  {freeDeliveryThreshold.toLocaleString()}원 이상 구매시 무료
                </FreeDeliveryInfo>
              </>
            )}
          </DeliveryRow>
          {estimatedDelivery && (
            <EstimatedDelivery>{estimatedDelivery}</EstimatedDelivery>
          )}
        </Info>
      </Content>
    </Container>
  );
}

const Container = tw.div`
  w-full
  px-5
  pb-5
  bg-bg-layer
  flex
  flex-col
  gap-5
`;

const Divider = tw.div`
  w-full
  h-px
  bg-stroke-neutral-subtle
`;

const Content = tw.div`
  flex
  items-start
  gap-2
`;

const IconWrapper = tw.div`
  w-5
  h-5
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const Info = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const DeliveryRow = tw.div`
  flex
  items-center
  flex-wrap
`;

const DeliveryFee = tw.span`
  text-base
  font-normal
  text-fg-neutral
  leading-5
`;

const Dot = tw.span`
  text-base
  font-normal
  text-fg-muted
  leading-5
  mx-1
`;

const FreeDeliveryInfo = tw.span`
  text-base
  font-normal
  text-fg-muted
  leading-5
`;

const EstimatedDelivery = tw.span`
  text-base
  font-normal
  text-fg-muted
  leading-5
`;

/**
 * Usage:
 *
 * <DeliverySection
 *   deliveryFee={3000}
 *   freeDeliveryThreshold={20000}
 *   estimatedDelivery="12.10(수) 이내 발송예정"
 * />
 */
