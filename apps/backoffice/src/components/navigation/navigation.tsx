import { useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Fragment } from 'react';
import tw from 'tailwind-styled-components';

import { NAV_GROUPS } from '@/components/navigation/data.tsx';
import { NavItem } from '@/components/navigation/nav-item.tsx';
import { useAuthStore } from '@/store/authStore';

export function Navigation() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <Sidebar>
      <UserInfoSection>
        <UserInfoContent>
          <UserName>yestravel</UserName>
          <UserEmail>{user?.email || ''}</UserEmail>
        </UserInfoContent>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={20} />
        </LogoutButton>
      </UserInfoSection>
      <NavContainer>
        {NAV_GROUPS.map((group, groupIndex) => (
          <Fragment key={group.title}>
            {groupIndex > 0 && <Divider />}
            <NavGroup>
              <GroupLabel>{group.title}</GroupLabel>
              {group.items.map((item) => (
                <NavItem key={item.url} url={item.url} icon={item.icon}>
                  {item.title}
                </NavItem>
              ))}
            </NavGroup>
          </Fragment>
        ))}
      </NavContainer>
    </Sidebar>
  );
}

const Sidebar = tw.aside`
  w-[280px]
  bg-white
  border-r
  border-zinc-200
  flex
  flex-col
  shrink-0
  h-full
  overflow-hidden
`;

const UserInfoSection = tw.div`
  flex
  items-center
  gap-5
  h-[100px]
  px-5
  py-8
`;

const UserInfoContent = tw.div`
  flex
  flex-col
  flex-1
  gap-1
`;

const UserName = tw.p`
  text-[21px]
  font-bold
  leading-7
  text-zinc-900
`;

const UserEmail = tw.p`
  text-[15px]
  leading-5
  text-zinc-500
`;

const LogoutButton = tw.button`
  flex
  items-center
  justify-center
  shrink-0
  w-6
  h-6
  text-zinc-400
  hover:text-zinc-900
  transition-colors
  cursor-pointer
`;

const NavContainer = tw.nav`
  flex
  flex-col
  p-2
  flex-1
  overflow-y-auto
`;

const NavGroup = tw.div`
  flex
  flex-col
`;

const GroupLabel = tw.div`
  flex
  items-center
  h-[36px]
  px-3
  text-[15px]
  text-zinc-900
`;

const Divider = tw.div`
  mx-3
  my-2
  border-t
  border-zinc-200
`;
