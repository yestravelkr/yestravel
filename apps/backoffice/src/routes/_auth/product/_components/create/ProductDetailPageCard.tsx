import { Input, Label, Textarea } from './styled';

import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';

export function ProductDetailPageCard() {
  return (
    <FormCard
      title="상세 페이지"
      description="고객에게 노출될 핵심 소개 문구와 상세 설명을 작성하세요."
    >
      <FormSection>
        <FormField>
          <Label htmlFor="summary">한 줄 소개</Label>
          <Input
            id="summary"
            name="summary"
            placeholder="예) 제주에서 즐기는 힐링 여행"
          />
        </FormField>
        <FormField>
          <Label htmlFor="description">상세 설명</Label>
          <Textarea
            id="description"
            name="description"
            rows={6}
            placeholder="일정, 포함 사항, 유의사항 등을 자세히 입력하세요."
          />
        </FormField>
      </FormSection>
    </FormCard>
  );
}
