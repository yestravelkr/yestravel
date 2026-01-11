/**
 * PaymentAgreementSection - 결제 동의 섹션
 *
 * 결제 동의 체크박스와 결제하기 버튼을 제공합니다.
 */

import { Checkbox } from '@yestravelkr/min-design-system';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type { NewOrderFormData } from '@/routes/new-order.$orderNumber';

const AGREEMENT_ITEMS = [
  '개인정보 수집 및 이용 동의',
  '개인정보 제공 및 위탁 동의',
  '전자금융거래 이용약관',
];

export interface PaymentAgreementSectionProps {
  totalAmount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PaymentAgreementSection({
  totalAmount,
  onSubmit,
  isSubmitting,
}: PaymentAgreementSectionProps) {
  const { watch } = useFormContext<NewOrderFormData>();
  const [agreed, setAgreed] = useState(false);

  const userName = watch('userName');
  const userPhone = watch('userPhone');
  const isFormValid = userName.trim().length > 0 && userPhone.trim().length > 0;
  const isValid = isFormValid && agreed;

  return (
    <Section>
      <AgreementList>
        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label="주문내용 확인 및 결제 동의"
        />

        {AGREEMENT_ITEMS.map(item => (
          <AgreementItemRow key={item}>
            <SmallCheckboxIcon $checked={agreed}>
              {agreed && (
                <i className="icon icon-check-solid text-white text-[10px]" />
              )}
            </SmallCheckboxIcon>
            <AgreementItemLabel>{item}</AgreementItemLabel>
            <ChevronIcon>
              <i className="icon icon-chevron-right text-fg-muted text-[16px]" />
            </ChevronIcon>
          </AgreementItemRow>
        ))}
      </AgreementList>

      <Divider />

      <ConfirmText>위 주문내용을 확인하였으며 결제에 동의합니다.</ConfirmText>

      <SubmitButton onClick={onSubmit} disabled={!isValid || isSubmitting}>
        {isSubmitting
          ? '처리 중...'
          : `${totalAmount.toLocaleString()}원 결제하기`}
      </SubmitButton>
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

const AgreementList = tw.div`
  flex
  flex-col
  gap-3
`;

const AgreementItemRow = tw.div`
  flex
  items-center
  gap-1
`;

const SmallCheckboxIcon = tw.div<{ $checked: boolean }>`
  w-4
  h-4
  rounded
  flex
  items-center
  justify-center
  border
  ${({ $checked }) =>
    $checked
      ? 'bg-[var(--fg-primary)] border-[var(--fg-primary)]'
      : 'bg-[var(--bg-field)] border-[var(--fg-disabled)]'}
`;

const AgreementItemLabel = tw.span`
  flex-1
  text-fg-muted
  text-sm
  font-normal
  leading-4
`;

const ChevronIcon = tw.div`
  w-4
  h-4
  flex
  items-center
  justify-center
`;

const Divider = tw.div`
  h-px
  bg-stroke-neutral
`;

const ConfirmText = tw.p`
  py-3
  text-center
  text-fg-neutral
  text-base
  font-normal
  leading-5
`;

const SubmitButton = tw.button`
  w-full
  h-12
  px-4
  bg-bg-neutral-solid
  rounded-xl
  text-fg-on-surface
  text-base
  font-medium
  leading-5
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  transition-colors
`;
