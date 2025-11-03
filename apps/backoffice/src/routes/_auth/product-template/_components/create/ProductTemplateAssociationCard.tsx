import { Label } from './styled';

import { BrandSelector } from '@/shared/components/form/BrandSelector';
import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';

export function ProductTemplateAssociationCard() {
  return (
    <FormCard title="상품 구분">
      <FormSection>
        <FormField>
          <Label htmlFor="brandId">브랜드</Label>
          <BrandSelector name="brandId" required />
        </FormField>
      </FormSection>
    </FormCard>
  );
}
