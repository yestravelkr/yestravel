import { Fragment } from 'react';
import tw from 'tailwind-styled-components';

import {
  BRAND_NAV_GROUPS,
  INFLUENCER_NAV_GROUPS,
} from '@/components/navigation/data.tsx';
import { NavItem } from '@/components/navigation/nav-item.tsx';
import { NavGroup } from '@/components/navigation/type';

/**
 * Navigation - 파트너 사이드바 네비게이션
 *
 * type에 따라 브랜드/인플루언서 메뉴를 표시한다.
 *
 * Usage:
 * <Navigation type="brand" />
 * <Navigation type="influencer" />
 */
export function Navigation({ type }: { type: 'brand' | 'influencer' }) {
  const navGroups: NavGroup[] =
    type === 'brand' ? BRAND_NAV_GROUPS : INFLUENCER_NAV_GROUPS;

  return (
    <Sidebar>
      <NavContainer>
        {navGroups.map((group) => (
          <NavGroupWrapper key={group.title}>
            <GroupTitle>{group.title}</GroupTitle>
            <NavItemsContainer>
              {group.items.map((item) => {
                if (item.items) {
                  return (
                    <Fragment key={item.title}>
                      <SectionTitle>
                        {item.icon && (
                          <IconWrapper>
                            <item.icon />
                          </IconWrapper>
                        )}
                        <span>{item.title}</span>
                      </SectionTitle>
                      <SubItemsContainer>
                        {item.items.map((subItem) => (
                          <NavItem key={subItem.url} url={subItem.url}>
                            {subItem.icon && <subItem.icon />}
                            {subItem.title}
                          </NavItem>
                        ))}
                      </SubItemsContainer>
                    </Fragment>
                  );
                }

                return (
                  <NavItem key={item.url} url={item.url}>
                    {item.icon && <item.icon />}
                    {item.title}
                  </NavItem>
                );
              })}
            </NavItemsContainer>
          </NavGroupWrapper>
        ))}
      </NavContainer>
    </Sidebar>
  );
}

const Sidebar = tw.aside`
  w-64
  bg-white
  border-r
  border-gray-200
  flex
  flex-col
  overflow-y-auto
`;

const NavContainer = tw.nav`
  flex
  flex-col
  px-3
  py-4
`;

const NavGroupWrapper = tw.div`
  mb-6
`;

const GroupTitle = tw.div`
  px-3
  mb-2
  text-xs
  font-semibold
  text-gray-500
  uppercase
  tracking-wider
`;

const NavItemsContainer = tw.div`
  space-y-1
`;

const SectionTitle = tw.div`
  flex
  items-center
  gap-2
  px-3
  py-2
  text-sm
  font-medium
  text-gray-700
  cursor-pointer
  hover:text-gray-900
`;

const IconWrapper = tw.div`
  text-gray-400
`;

const SubItemsContainer = tw.div`
  ml-6
  space-y-1
`;
