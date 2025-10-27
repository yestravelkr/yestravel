import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

import { FormRow, Label } from './styled';

import { TagsInput } from '@/shared/components';
import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';
import { Input } from '@/shared/components/form/Input';

interface ProductTemplateDetailInfoCardProps {
  /** React Hook Form register */
  register: UseFormRegister<any>;
  /** React Hook Form setValue */
  setValue: UseFormSetValue<any>;
  /** React Hook Form watch */
  watch: UseFormWatch<any>;
}

export function ProductTemplateDetailInfoCard({
  register,
  setValue,
  watch,
}: ProductTemplateDetailInfoCardProps) {
  const bedTypes = watch('bedTypes') || [];
  const tags = watch('tags') || [];

  return (
    <FormCard title="상세 정보">
      <FormSection>
        <FormRow>
          <FormField>
            <Label htmlFor="baseCapacity">기준 인원</Label>
            <Input
              id="baseCapacity"
              type="number"
              min={1}
              placeholder="0"
              postfix={'명'}
              {...register('baseCapacity', { valueAsNumber: true })}
            />
          </FormField>
          <FormField>
            <Label htmlFor="maxCapacity">최대 인원</Label>
            <Input
              id="maxCapacity"
              type="number"
              min={1}
              placeholder="0"
              postfix={'명'}
              {...register('maxCapacity', { valueAsNumber: true })}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField>
            <Label htmlFor="checkInTime">입실 시간</Label>
            <Input id="checkInTime" type="time" {...register('checkInTime')} />
          </FormField>
          <FormField>
            <Label htmlFor="checkOutTime">퇴실 시간</Label>
            <Input
              id="checkOutTime"
              type="time"
              {...register('checkOutTime')}
            />
          </FormField>
        </FormRow>
        <FormField>
          <Label htmlFor="bedTypes">침대 구성</Label>
          <TagsInput
            placeholder="예) 퀸베드 1개, 싱글베드 1개"
            defaultValues={bedTypes}
            onChange={(value) => setValue('bedTypes', value)}
          />
        </FormField>
        <FormField>
          <Label htmlFor="tags">태그</Label>
          <TagsInput
            placeholder="예) 바다 전망, 조식 포함"
            defaultValues={tags}
            onChange={(value) => setValue('tags', value)}
          />
        </FormField>
      </FormSection>
    </FormCard>
  );
}
