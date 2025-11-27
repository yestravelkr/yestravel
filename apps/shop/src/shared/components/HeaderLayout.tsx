/**
 * HeaderLayout - 헤더가 있는 레이아웃 컴포넌트
 *
 * 헤더와 컨텐츠 영역으로 구성된 기본 레이아웃 컴포넌트입니다.
 */

import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

export interface HeaderLayoutProps {
  /** 헤더에 표시될 캠페인명 */
  title: string;
  /** 헤더 왼쪽에 표시될 아이콘 (뒤로가기 등) */
  icon?: ReactNode;
  /** 레이아웃 내부에 표시될 컨텐츠 */
  children: ReactNode;
}

const Container = tw.main`
  min-h-screen
  bg-gray-50
`;

export function HeaderLayout({ title, icon, children }: HeaderLayoutProps) {
  return (
    <Container>
      <Header>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <TitleWrapper>
          <Title>{title}</Title>
        </TitleWrapper>
      </Header>
      {children}
    </Container>
  );
}

const Header = tw.header`
  w-full
  p-5
  inline-flex
  justify-start
  items-center
  gap-3
`;

const IconWrapper = tw.div`
  w-6
  h-6
  relative
  overflow-hidden
`;

const TitleWrapper = tw.div`
  flex-1
  inline-flex
  flex-col
  justify-start
  items-start
  gap-1
`;

const Title = tw.div`
  self-stretch
  justify-start
  text-fg-neutral
  text-lg
  font-bold
  leading-6
`;

/**
 * Usage:
 *
 * <HeaderLayout
 *   title="캠페인명"
 *   icon={<BackIcon />}
 * >
 *   <div>Your content here</div>
 * </HeaderLayout>
 */
