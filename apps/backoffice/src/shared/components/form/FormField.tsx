import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <FieldContainer>
      <Label>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </Label>
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FieldContainer>
  );
}

const FieldContainer = tw.div`
  flex flex-col
  gap-2
`;

const Label = tw.label`
  text-[15px]
  leading-5
  text-[var(--fg-muted,#71717A)]
`;

const RequiredMark = tw.span`
  text-[var(--fg-critical,#EB3D3D)]
  ml-1
`;

const ErrorMessage = tw.p`
  text-sm
  text-[var(--fg-critical,#EB3D3D)]
`;
