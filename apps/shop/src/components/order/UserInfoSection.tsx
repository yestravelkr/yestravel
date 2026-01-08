/**
 * UserInfoSection - 이용자 정보 섹션
 *
 * 숙박 주문에서 이용자 정보를 표시하는 컴포넌트입니다.
 *
 * Usage:
 * <UserInfoSection
 *   user={{ name: "김주민", phone: "010-0000-0000" }}
 * />
 */

import tw from 'tailwind-styled-components';

export interface UserInfoSectionProps {
  user: {
    name: string;
    phone: string;
  };
}

export function UserInfoSection({ user }: UserInfoSectionProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>이용자</SectionTitle>
      </SectionHeader>
      <InfoList>
        <InfoRow>
          <InfoLabel>이름</InfoLabel>
          <InfoValue>{user.name}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>연락처</InfoLabel>
          <InfoValue>{user.phone}</InfoValue>
        </InfoRow>
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
