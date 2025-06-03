import { Link, LinkProps } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

export const NavItem = ({
  url,
  children,
}: PropsWithChildren<{ url: LinkProps['to'] }>) => {
  return (
    <Link to={url} className="block p-2 rounded hover:bg-yellow-400">
      {children}
    </Link>
  );
};
