import { Link, LinkProps } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';
import tw from 'tailwind-styled-components';

interface NavItemProps {
  url: LinkProps['to'];
  icon?: React.ElementType;
}

export const NavItem = ({
  url,
  icon: Icon,
  children,
}: PropsWithChildren<NavItemProps>) => {
  return (
    <StyledLink to={url}>
      {Icon && (
        <IconWrapper>
          <Icon size={22} />
        </IconWrapper>
      )}
      {children}
    </StyledLink>
  );
};

const StyledLink = tw(Link)`
  group
  flex
  items-center
  gap-2
  h-[44px]
  px-3
  text-[16.5px]
  leading-[22px]
  text-zinc-900
  rounded-xl
  transition-colors
  hover:bg-zinc-100
  [&.active]:bg-zinc-100
`;

const IconWrapper = tw.div`
  flex
  items-center
  justify-center
  h-[22px]
  w-[22px]
  shrink-0
  text-zinc-400
  group-[.active]:text-zinc-900
  [&_svg]:stroke-[1.5]
  group-[.active]:[&_svg]:stroke-2
`;
