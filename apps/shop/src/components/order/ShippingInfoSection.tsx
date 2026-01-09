/**
 * ShippingInfoSection - 배송지 정보 섹션
 *
 * 배송 주문에서 배송지 정보를 표시하는 컴포넌트입니다.
 *
 * Usage:
 * <ShippingInfoSection
 *   shipping={{
 *     recipientName: "김주민",
 *     phone: "010-0000-0000",
 *     address: "(12345) 서울 강남구...",
 *     request: "문 앞에 놓아주세요"
 *   }}
 * />
 */

import tw from 'tailwind-styled-components';

export interface ShippingInfoSectionProps {
  shipping: {
    recipientName: string;
    phone: string;
    address: string;
    request?: string;
  };
}

export function ShippingInfoSection({ shipping }: ShippingInfoSectionProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>배송지</SectionTitle>
      </SectionHeader>
      <InfoList>
        <InfoRow>
          <InfoLabel>받는사람</InfoLabel>
          <InfoValue>{shipping.recipientName}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>연락처</InfoLabel>
          <InfoValue>{shipping.phone}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>주소</InfoLabel>
          <InfoValueFlex>{shipping.address}</InfoValueFlex>
        </InfoRow>
        {shipping.request && (
          <InfoRow>
            <InfoLabel>요청사항</InfoLabel>
            <InfoValueFlex>{shipping.request}</InfoValueFlex>
          </InfoRow>
        )}
      </InfoList>
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

const SectionHeader = tw.div`
  flex
  items-center
  justify-between
`;

const SectionTitle = tw.h3`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const InfoList = tw.div`
  flex
  flex-col
  gap-2
`;

const InfoRow = tw.div`
  flex
  items-start
  text-[15px]
  leading-5
`;

const InfoLabel = tw.span`
  w-20
  text-fg-muted
  flex-shrink-0
`;

const InfoValue = tw.span`
  text-fg-neutral
`;

const InfoValueFlex = tw.span`
  flex-1
  text-fg-neutral
`;
