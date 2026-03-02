import { Link, LinkProps } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';
import tw from 'tailwind-styled-components';

export const NavItem = ({
  url,
  children,
}: PropsWithChildren<{ url: LinkProps['to'] }>) => {
  return <StyledLink to={url}>{children}</StyledLink>;
};

const StyledLink = tw(Link)`
  flex
  items-center
  gap-2
  px-3
  py-2
  text-sm
  text-gray-600
  rounded-lg
  transition-colors
  hover:bg-gray-100
  hover:text-gray-900
  [&.active]:bg-blue-50
  [&.active]:text-blue-600
  [&.active]:font-medium
`;
