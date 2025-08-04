import { Fragment } from 'react';
import tw from 'tailwind-styled-components';

import { NAV_GROUPS } from '@/components/navigation/data.tsx';
import { NavItem } from '@/components/navigation/nav-item.tsx';

export function Navigation() {
  return (
    <Sidebar>
      <NavContainer>
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.title}>
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
          </NavGroup>
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

const NavGroup = tw.div`
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
