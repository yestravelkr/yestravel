import { useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';
import { useAuthStore } from '@/store';

/**
 * Header - 파트너 페이지 상단 헤더
 *
 * 로고, 타이틀("파트너"), 사용자 정보, 로그아웃 버튼을 표시한다.
 *
 * Usage:
 * <Header />
 */
export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const logoutMutation = trpc.partnerAuth.logout.useMutation({
    onSuccess: () => {
      logout();
      navigate({ to: '/' });
    },
    onError: () => {
      toast.error('로그아웃에 실패했습니다');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
          <LogoutButton onClick={handleLogout}>
            <LogOut size={16} />
            로그아웃
          </LogoutButton>
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

const LogoutButton = tw.button`
  flex items-center gap-1
  px-3 py-1.5
  text-sm text-gray-500
  hover:text-gray-700
  border border-gray-200
  rounded-md
  hover:bg-gray-50
  transition-colors
`;
