/**
 * HeaderLayout - 헤더가 있는 레이아웃 컴포넌트
 *
 * 헤더와 컨텐츠 영역으로 구성된 기본 레이아웃 컴포넌트입니다.
 * title에 문자열 또는 커스텀 컴포넌트를 전달할 수 있습니다.
 */

import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

export interface HeaderLayoutProps {
  /** 헤더에 표시될 타이틀 (문자열 또는 커스텀 컴포넌트) */
  title?: ReactNode;
  /** 헤더 왼쪽에 표시될 아이콘 (뒤로가기 등) */
  left?: ReactNode;
  /** 헤더 오른쪽에 표시될 컴포넌트 (로그인 버튼 등) */
  right?: ReactNode;
  /** 레이아웃 내부에 표시될 컨텐츠 */
  children: ReactNode;
}

export function HeaderLayout({
  title,
  left,
  right,
  children,
}: HeaderLayoutProps) {
  const isStringTitle = typeof title === 'string';

  return (
    <Container>
      <Header>
        <LeftWrapper>{left}</LeftWrapper>
        <TitleWrapper>
          <TitleContent>
            {isStringTitle ? <Title>{title}</Title> : title}
          </TitleContent>
        </TitleWrapper>
        <RightWrapper>{right}</RightWrapper>
      </Header>
      {children}
    </Container>
  );
}

const Container = tw.main`
  min-h-screen
  bg-white
  max-w-[600px]
  mx-auto
`;

const Header = tw.header`
  w-full
  h-16
  px-5
  py-4
  bg-white
  border-b
  border-stroke-neutral
  relative
  flex
  items-center
  justify-between
`;

const LeftWrapper = tw.div`
  flex
  items-center
  z-10
`;

const TitleWrapper = tw.div`
  absolute
  inset-x-0
  flex
  items-center
  justify-center
  pointer-events-none
`;

const TitleContent = tw.div`
  pointer-events-auto
`;

const Title = tw.div`
  text-fg-neutral
  text-lg
  font-bold
  leading-6
`;

const RightWrapper = tw.div`
  flex
  items-center
  z-10
`;

/**
 * Usage:
 *
 * // 기본 사용법 - 문자열 타이틀
 * <HeaderLayout
 *   title="캠페인명"
 *   left={<BackIcon />}
 *   right={<LoginButton />}
 * >
 *   <div>Your content here</div>
 * </HeaderLayout>
 *
 * // 커스텀 타이틀 컴포넌트 사용
 * <HeaderLayout
 *   title={<InfluencerProfile avatarUrl="..." name="홍영기" handle="travel_yg" />}
 *   right={<LoginButton onClick={handleLogin}>로그인</LoginButton>}
 * >
 *   <div>Your content here</div>
 * </HeaderLayout>
 */
