import tw from 'tailwind-styled-components';

import { FormField } from './FormField';

interface FieldWrapperProps {
  label: string;
  value?: string | null;
  isEditMode: boolean;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

export function FieldWrapper({
  label,
  value,
  isEditMode,
  children,
  required,
  error,
}: FieldWrapperProps) {
  if (isEditMode) {
    return (
      <FormField label={label} error={error} required={required}>
        {children}
      </FormField>
    );
  }

  return (
    <InfoItem>
      <InfoLabel>{label}</InfoLabel>
      <InfoValue>{value || '-'}</InfoValue>
    </InfoItem>
  );
}

const InfoItem = tw.div`
  space-y-1
`;

const InfoLabel = tw.dt`
  text-sm
  font-medium
  text-gray-500
`;

const InfoValue = tw.dd`
  text-sm
  text-gray-900
`;
