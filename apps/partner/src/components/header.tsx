import tw from 'tailwind-styled-components';

import { useAuthStore } from '@/store';

/**
 * Header - 파트너 페이지 상단 헤더
 *
 * 로고, 타이틀("파트너"), 사용자 정보를 표시한다.
 *
 * Usage:
 * <Header />
 */
export function Header() {
  const { user } = useAuthStore();

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <Logo src="/logo.png" alt="YesTravel" />
          <Title>파트너</Title>
        </LogoSection>

        <RightSection>
          <UserInfo>
            <UserAvatar>
              {user?.email?.charAt(0).toUpperCase() || 'P'}
            </UserAvatar>
            <UserName>{user?.email || 'Partner'}</UserName>
          </UserInfo>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
}

const HeaderContainer = tw.header`
  bg-white
  border-b
  border-gray-200
  sticky
  top-0
  z-50
`;

const HeaderContent = tw.div`
  max-w-full
  mx-auto
  px-6
  h-16
  flex
  items-center
  justify-between
`;

const LogoSection = tw.div`
  flex
  items-center
  gap-3
`;

const Logo = tw.img`
  h-8
  w-auto
`;

const Title = tw.h1`
  text-xl
  font-semibold
  text-gray-900
`;

const RightSection = tw.div`
  flex
  items-center
  gap-4
`;

const UserInfo = tw.div`
  flex
  items-center
  gap-3
`;

const UserAvatar = tw.div`
  w-10
  h-10
  rounded-full
  bg-gradient-to-br
  from-blue-500
  to-indigo-600
  flex
  items-center
  justify-center
  text-white
  font-medium
`;

const UserName = tw.span`
  text-sm
  font-medium
  text-gray-700
`;
