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
  space-y-1
`;

const Label = tw.label`
  block 
  text-sm 
  font-medium 
  text-gray-700
`;

const RequiredMark = tw.span`
  text-red-500 
  ml-1
`;

const ErrorMessage = tw.p`
  text-sm 
  text-red-600
`;
