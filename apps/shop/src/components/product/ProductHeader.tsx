/**
 * ProductHeader - 상품 상세 페이지 헤더 컴포넌트들
 *
 * InfluencerProfile: 인플루언서 프로필(아바타, 이름, 핸들) 표시
 * HeaderLoginButton: 헤더용 로그인 버튼
 *
 * HeaderLayout과 함께 사용할 수 있도록 분리된 컴포넌트들입니다.
 */

import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

/**
 * InfluencerProfile - 인플루언서 프로필 컴포넌트
 *
 * HeaderLayout의 title prop으로 사용할 수 있습니다.
 */
export interface InfluencerProfileProps {
  /** 인플루언서 프로필 이미지 URL */
  avatarUrl: string;
  /** 인플루언서 이름 */
  name: string;
  /** 인플루언서 핸들 (@ 포함하지 않음) */
  handle: string;
}

export function InfluencerProfile({
  avatarUrl,
  name,
  handle,
}: InfluencerProfileProps) {
  return (
    <ProfileSection>
      <AvatarWrapper>
        <Avatar src={avatarUrl} alt={name} />
      </AvatarWrapper>
      <ProfileInfo>
        <Name>{name}</Name>
        <Handle>@{handle}</Handle>
      </ProfileInfo>
    </ProfileSection>
  );
}

/**
 * HeaderLoginButton - 헤더용 로그인 버튼
 *
 * HeaderLayout의 right prop으로 사용할 수 있습니다.
 */
export interface HeaderLoginButtonProps {
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 버튼 내용 (기본값: "로그인") */
  children?: ReactNode;
}

export function HeaderLoginButton({
  onClick,
  children = '로그인',
}: HeaderLoginButtonProps) {
  return <LoginButton onClick={onClick}>{children}</LoginButton>;
}

/**
 * ProductHeader - 기존 호환성을 위한 통합 컴포넌트
 *
 * @deprecated HeaderLayout + InfluencerProfile + HeaderLoginButton 조합 사용 권장
 */
export interface ProductHeaderProps {
  /** 인플루언서 프로필 이미지 URL */
  avatarUrl: string;
  /** 인플루언서 이름 */
  name: string;
  /** 인플루언서 핸들 (@ 포함하지 않음) */
  handle: string;
  /** 로그인 버튼 클릭 핸들러 */
  onLoginClick?: () => void;
  /** 로그인 여부 */
  isLoggedIn?: boolean;
}

export function ProductHeader({
  avatarUrl,
  name,
  handle,
  onLoginClick,
  isLoggedIn = false,
}: ProductHeaderProps) {
  return (
    <Container>
      <InfluencerProfile avatarUrl={avatarUrl} name={name} handle={handle} />
      {!isLoggedIn && <HeaderLoginButton onClick={onLoginClick} />}
    </Container>
  );
}

const Container = tw.header`
  w-full
  h-16
  px-5
  py-4
  bg-white
  border-b
  border-stroke-neutral
  flex
  items-center
  gap-2
`;

const ProfileSection = tw.div`
  flex
  items-center
  gap-3
`;

const AvatarWrapper = tw.div`
  w-8
  h-8
  rounded-full
  overflow-hidden
  outline
  outline-1
  outline-stroke-neutral-overlay/5
`;

const Avatar = tw.img`
  w-full
  h-full
  object-cover
`;

const ProfileInfo = tw.div`
  flex
  flex-col
`;

const Name = tw.span`
  text-lg
  font-bold
  text-fg-neutral
  leading-6
`;

const Handle = tw.span`
  text-xs
  font-normal
  text-fg-muted
  leading-4
`;

const LoginButton = tw.button`
  h-9
  px-3
  bg-bg-neutral-subtle
  rounded-xl
  outline
  outline-1
  outline-stroke-neutral
  text-base
  font-medium
  text-fg-neutral
  leading-5
  hover:bg-bg-neutral
  transition-colors
`;

/**
 * Usage:
 *
 * // 방법 1: HeaderLayout과 분리된 컴포넌트 사용 (권장)
 * <HeaderLayout
 *   title={<InfluencerProfile avatarUrl="..." name="홍영기" handle="travel_yg" />}
 *   right={<HeaderLoginButton onClick={handleLogin} />}
 * >
 *   <div>Content</div>
 * </HeaderLayout>
 *
 * // 방법 2: 기존 통합 컴포넌트 사용 (deprecated)
 * <ProductHeader
 *   avatarUrl="https://example.com/avatar.jpg"
 *   name="홍영기"
 *   handle="travel_yg"
 *   onLoginClick={() => navigate('/login')}
 * />
 */
