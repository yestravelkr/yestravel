import { HTMLAttributes, ReactNode } from 'react';
import tw from 'tailwind-styled-components';

const FormCardContainer = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-6
`;

interface FormCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
}

export function FormCard({
  title,
  description,
  children,
  ...props
}: FormCardProps) {
  return (
    <FormCardContainer {...props}>
      {title ? <FormTitle>{title}</FormTitle> : null}
      {description ? <FormDescription>{description}</FormDescription> : null}
      {children}
    </FormCardContainer>
  );
}

export const FormTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
`;

export const FormDescription = tw.p`
  mt-2
  text-sm
  text-gray-600
  mb-6
`;

export const FormSection = tw.div`
  space-y-4
`;

export const FormField = tw.div`
  space-y-2
`;
