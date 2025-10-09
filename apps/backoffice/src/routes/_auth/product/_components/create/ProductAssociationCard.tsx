import { Label, Select } from './styled';

import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';

export function ProductAssociationCard() {
  return (
    <FormCard title="상품 구분">
      <FormSection>
        <FormField>
          <Label htmlFor="brand">브랜드</Label>
          <Select id="brand" name="brand">
            <option value="">브랜드를 선택하세요</option>
            <option value="brand-a">예시 브랜드 A</option>
            <option value="brand-b">예시 브랜드 B</option>
            <option value="brand-c">예시 브랜드 C</option>
          </Select>
        </FormField>
        <FormField>
          <Label htmlFor="hotel">호텔</Label>
          <Select id="hotel" name="hotel">
            <option value="">호텔을 선택하세요</option>
            <option value="hotel-jeju">제주 힐튼 호텔</option>
            <option value="hotel-busan">부산 그랜드 리조트</option>
            <option value="hotel-seoul">서울 시그니엘</option>
          </Select>
        </FormField>
      </FormSection>
    </FormCard>
  );
}
