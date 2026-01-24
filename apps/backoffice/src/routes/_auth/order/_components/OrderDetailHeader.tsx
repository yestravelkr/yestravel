/**
 * OrderDetailHeader - 주문 상세 헤더 컴포넌트
 *
 * 뒤로가기 버튼, 주문번호, 캠페인/인플루언서 정보 표시
 */

import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface OrderDetailHeaderProps {
  /** 주문번호 */
  orderNumber: string;
  /** 캠페인명 */
  campaignName: string;
  /** 인플루언서명 */
  influencerName: string;
  /** 주문일시 */
  orderedAt: string;
}

/**
 * Usage:
 * ```tsx
 * <OrderDetailHeader
 *   orderNumber="12341231231"
 *   campaignName="캠페인1"
 *   influencerName="인플루언서1"
 *   orderedAt="25.01.01 13:00"
 * />
 * ```
 */
export function OrderDetailHeader({
  orderNumber,
  campaignName,
  influencerName,
  orderedAt,
}: OrderDetailHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/order/hotel' });
  };

  return (
    <Container>
      <BackButton onClick={handleBack}>
        <ArrowLeft size={22} />
      </BackButton>
      <InfoSection>
        <OrderNumber>{orderNumber}</OrderNumber>
        <SubInfo>
          <span>{campaignName}</span>
          <Dot>∙</Dot>
          <span>{influencerName}</span>
          <Dot>∙</Dot>
          <MutedText>{orderedAt}</MutedText>
        </SubInfo>
      </InfoSection>
    </Container>
  );
}

const Container = tw.div`
  flex
  gap-3
  items-start
  w-full
`;

const BackButton = tw.button`
  flex
  items-center
  justify-center
  w-11
  h-11
  rounded-full
  bg-[var(--bg-neutral-subtle,#FFF)]
  border
  border-[var(--stroke-neutral)]
  text-[var(--fg-neutral)]
  hover:bg-[var(--bg-neutral-subtle)]
  transition-colors
  shrink-0
`;

const InfoSection = tw.div`
  flex
  flex-col
  gap-1
  flex-1
  items-center
  justify-center
`;

const OrderNumber = tw.h1`
  text-[27px]
  font-bold
  leading-9
  text-[var(--fg-neutral)]
  w-full
  py-1
`;

const SubInfo = tw.div`
  flex
  gap-1
  items-start
  text-[15px]
  leading-5
  text-[var(--fg-neutral)]
  w-full
`;

const Dot = tw.span`
  text-[var(--fg-neutral)]
`;

const MutedText = tw.span`
  text-[var(--fg-muted)]
`;
