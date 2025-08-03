import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Container>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {action && <ActionWrapper>{action}</ActionWrapper>}
    </Container>
  );
}

const Container = tw.div`
  flex 
  flex-col 
  items-center 
  justify-center 
  py-12 
  px-6
  text-center
`;

const IconWrapper = tw.div`
  mb-4 
  text-gray-400
`;

const Title = tw.h3`
  text-lg 
  font-medium 
  text-gray-900 
  mb-2
`;

const Description = tw.p`
  text-sm 
  text-gray-500 
  max-w-sm
`;

const ActionWrapper = tw.div`
  mt-6
`;
