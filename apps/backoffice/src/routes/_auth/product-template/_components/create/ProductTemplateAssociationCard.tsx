import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { Label } from './styled';

import { BrandSelector } from '@/shared/components/form/BrandSelector';
import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';

export function ProductTemplateAssociationCard() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <FormCard title="상품 구분">
      <FormSection>
        <FormField>
          <Label htmlFor="brandId">브랜드</Label>
          <BrandSelector name="brandId" required />
          {errors?.brandId && (
            <ErrorMessage>{errors.brandId.message as string}</ErrorMessage>
          )}
        </FormField>
      </FormSection>
    </FormCard>
  );
}

const ErrorMessage = tw.p`
  mt-1
  text-sm
  text-red-500
`;
