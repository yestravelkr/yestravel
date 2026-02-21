/**
 * UserInputSection - 이용자 정보 입력 섹션
 *
 * 이름, 연락처 입력 필드와 "내 정보와 같아요" 체크박스를 제공합니다.
 */

import { Checkbox } from '@yestravelkr/min-design-system';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import type { NewOrderFormData } from '@/routes/_auth/new-order.$orderNumber';

export function UserInputSection() {
  const { watch, setValue, register } = useFormContext<NewOrderFormData>();

  const useSameAsMe = watch('useSameAsMe');

  const handleUseSameAsMeChange = (checked: boolean) => {
    setValue('useSameAsMe', checked);
    if (checked) {
      // TODO: 실제로는 로그인된 사용자 정보를 가져와야 함
      toast.info('로그인 정보를 불러옵니다.');
    }
  };

  return (
    <Section>
      <SectionTitle>이용자 정보</SectionTitle>

      <InputGroup>
        <InputLabel>이름</InputLabel>
        <StyledInput
          {...register('userName')}
          placeholder="이름을 입력해 주세요."
        />
      </InputGroup>

      <InputGroup>
        <InputLabel>연락처</InputLabel>
        <StyledInput
          {...register('userPhone')}
          placeholder="숫자만 입력해 주세요."
          inputMode="numeric"
        />
      </InputGroup>

      <CheckboxWrapper>
        <Checkbox
          checked={useSameAsMe}
          onChange={handleUseSameAsMeChange}
          label="내 정보와 같아요."
        />
      </CheckboxWrapper>
    </Section>
  );
}

const Section = tw.section`
  p-5
  bg-white
  flex
  flex-col
  gap-5
`;

const SectionTitle = tw.h2`
  text-fg-neutral
  text-lg
  font-bold
  leading-6
`;

const InputGroup = tw.div`
  flex
  flex-col
  gap-2
`;

const InputLabel = tw.label`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const StyledInput = tw.input`
  h-11
  px-4
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  text-base
  font-normal
  leading-5
  placeholder:text-fg-placeholder
  focus:outline-[var(--stroke-primary)]
`;

const CheckboxWrapper = tw.div`
  h-9
  py-2
`;
