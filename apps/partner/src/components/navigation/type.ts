import { LinkProps } from '@tanstack/react-router';

type BaseNavItem = {
  title: string;
  icon?: React.ElementType;
};

type NavLink = BaseNavItem & {
  url: LinkProps['to'];
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

export type NavGroup = {
  title: string;
  items: NavItem[];
};
