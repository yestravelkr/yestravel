import { Truck } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { InfoRowSection } from './InfoRowSection';

/**
 * DeliverySection - 배송비/배송예정일 표시
 */
export interface DeliverySectionProps {
  /** 배송비 (원) */
  deliveryFee: number;
  /** 무료배송 기준 금액 */
  freeDeliveryThreshold?: number | null;
  /** 배송 예정일 텍스트 */
  estimatedDelivery?: string;
}

/**
 * Usage:
 * <DeliverySection deliveryFee={3000} freeDeliveryThreshold={50000} estimatedDelivery="3~5일 이내 도착" />
 */
export function DeliverySection({
  deliveryFee,
  freeDeliveryThreshold,
  estimatedDelivery,
}: DeliverySectionProps) {
  return (
    <InfoRowSection icon={<Truck size={18} />}>
      <DeliveryRow>
        <DeliveryFee>
          배송비{' '}
          {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
        </DeliveryFee>
        {freeDeliveryThreshold && (
          <>
            <Dot>·</Dot>
            <FreeDeliveryInfo>
              {freeDeliveryThreshold.toLocaleString()}원 이상 무료배송
            </FreeDeliveryInfo>
          </>
        )}
      </DeliveryRow>
      {estimatedDelivery && (
        <EstimatedDelivery>{estimatedDelivery}</EstimatedDelivery>
      )}
    </InfoRowSection>
  );
}

const DeliveryRow = tw.div`
  flex items-center flex-wrap
`;

const DeliveryFee = tw.span`
  text-base font-normal text-fg-neutral leading-5
`;

const Dot = tw.span`
  text-base font-normal text-fg-muted leading-5 mx-1
`;

const FreeDeliveryInfo = tw.span`
  text-base font-normal text-fg-muted leading-5
`;

const EstimatedDelivery = tw.span`
  text-base font-normal text-fg-muted leading-5
`;
