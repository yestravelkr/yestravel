import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

/**
 * InfoRowSection - 아이콘+정보 행 공통 레이아웃
 */
export interface InfoRowSectionProps {
  /** 좌측 아이콘 */
  icon: ReactNode;
  /** 우측 정보 콘텐츠 */
  children: ReactNode;
}

/**
 * Usage:
 * <InfoRowSection icon={<Truck size={18} />}>
 *   <span>배송비 3,000원</span>
 * </InfoRowSection>
 */
export function InfoRowSection({ icon, children }: InfoRowSectionProps) {
  return (
    <Container>
      <Divider />
      <Content>
        <IconWrapper>{icon}</IconWrapper>
        <Info>{children}</Info>
      </Content>
    </Container>
  );
}

const Container = tw.div`
  w-full px-5 pb-5 bg-bg-layer flex flex-col gap-5
`;

const Divider = tw.div`
  w-full h-px bg-stroke-neutral-subtle
`;

const Content = tw.div`
  flex items-start gap-2
`;

const IconWrapper = tw.div`
  w-5 h-5 flex items-center justify-center text-fg-neutral
`;

const Info = tw.div`
  flex-1 flex flex-col gap-1
`;
