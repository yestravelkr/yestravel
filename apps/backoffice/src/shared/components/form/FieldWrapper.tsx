import tw from 'tailwind-styled-components';

import { FormField } from './FormField';

interface FieldWrapperProps {
  label: string;
  value?: string | null;
  isEditMode: boolean;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  type?: 'text' | 'image';
}

export function FieldWrapper({
  label,
  value,
  isEditMode,
  children,
  required,
  error,
  type = 'text',
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
      {type === 'image' ? (
        value ? (
          <ImagePreview>
            <img
              src={value}
              alt={label}
              className="w-[130px] h-[130px] object-cover"
            />
          </ImagePreview>
        ) : (
          <InfoValue>-</InfoValue>
        )
      ) : (
        <InfoValue>{value || '-'}</InfoValue>
      )}
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

const ImagePreview = tw.div`
  w-[130px]
  h-[130px]
  rounded-lg
  overflow-hidden
  border
  border-gray-200
`;
