import { UseFormRegister } from 'react-hook-form';

import { Label, Select } from './styled';

import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';

interface ProductTemplateAssociationCardProps {
  /** React Hook Form register */
  register: UseFormRegister<any>;
}

export function ProductTemplateAssociationCard({
  register,
}: ProductTemplateAssociationCardProps) {
  return (
    <FormCard title="상품 구분">
      <FormSection>
        <FormField>
          <Label htmlFor="brandId">브랜드</Label>
          <Select
            id="brandId"
            {...register('brandId', { valueAsNumber: true })}
          >
            <option value="">브랜드를 선택하세요</option>
            <option value="1">예시 브랜드 A</option>
            <option value="2">예시 브랜드 B</option>
            <option value="3">예시 브랜드 C</option>
          </Select>
        </FormField>
      </FormSection>
    </FormCard>
  );
}
