import { FormRow, Label } from './styled';

import { TagsInput } from '@/shared/components';
import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';
import { Input } from '@/shared/components/form/Input';

export function ProductTemplateDetailInfoCard() {
  return (
    <FormCard title="상세 정보">
      <FormSection>
        <FormRow>
          <FormField>
            <Label htmlFor="base-capacity">기준 인원</Label>
            <Input
              id="base-capacity"
              name="baseCapacity"
              type="number"
              min={1}
              placeholder="0"
              postfix={'명'}
            />
          </FormField>
          <FormField>
            <Label htmlFor="max-capacity">최대 인원</Label>
            <Input
              id="max-capacity"
              name="maxCapacity"
              type="number"
              min={1}
              placeholder="0"
              postfix={'명'}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField>
            <Label htmlFor="check-in-time">입실 시간</Label>
            <Input id="check-in-time" name="checkInTime" type="time" />
          </FormField>
          <FormField>
            <Label htmlFor="check-out-time">퇴실 시간</Label>
            <Input id="check-out-time" name="checkOutTime" type="time" />
          </FormField>
        </FormRow>
        <FormField>
          <Label htmlFor="bed-config">침대 구성</Label>
          <TagsInput placeholder="예) 퀸베드 1개, 싱글베드 1개" />
        </FormField>
        <FormField>
          <Label htmlFor="tags">태그</Label>
          <TagsInput placeholder="예) 바다 전망, 조식 포함" />
        </FormField>
      </FormSection>
    </FormCard>
  );
}
