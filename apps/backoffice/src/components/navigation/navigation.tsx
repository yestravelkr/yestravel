import { Fragment } from 'react';

import { NAV_GROUPS } from '@/components/navigation/data.tsx';
import { NavItem } from '@/components/navigation/nav-item.tsx';

export function Navigation() {
  return (
    <aside className="w-64 bg-pink-100 p-4 flex flex-col space-y-4">
      <nav className="flex flex-col space-y-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div>{group.title}</div>
            <div>
              {group.items.map((item) => {
                if (item.items) {
                  return (
                    <Fragment key={item.title}>
                      <div>
                        {item.icon && <item.icon />} {item.title}
                      </div>
                      {item.items.map((subItem) => (
                        <NavItem key={subItem.url} url={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                          {subItem.title}
                        </NavItem>
                      ))}
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
