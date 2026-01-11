/**
 * PaymentMethodSection - 결제수단 선택 섹션
 *
 * 간편결제/일반결제 탭과 결제수단 라디오 버튼을 제공합니다.
 */

import { Circle, CircleDot } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type { NewOrderFormData } from '@/routes/new-order.$orderNumber';

export type PaymentType = 'simple' | 'general';
export type PaymentMethod = 'kakaopay' | 'naverpay' | 'toss' | 'card' | 'bank';

const SIMPLE_PAYMENT_METHODS = [
  { value: 'kakaopay' as const, label: '카카오페이' },
  { value: 'naverpay' as const, label: '네이버페이' },
  { value: 'toss' as const, label: '토스' },
];

const GENERAL_PAYMENT_METHODS = [
  { value: 'card' as const, label: '신용/체크카드' },
  { value: 'bank' as const, label: '계좌이체' },
];

export function PaymentMethodSection() {
  const { watch, setValue } = useFormContext<NewOrderFormData>();

  const paymentType = watch('paymentType');
  const paymentMethod = watch('paymentMethod');

  const handlePaymentTypeChange = (type: PaymentType) => {
    setValue('paymentType', type);
    // 결제 타입 변경 시 기본 결제수단으로 초기화
    setValue('paymentMethod', type === 'simple' ? 'kakaopay' : 'card');
  };

  const methods =
    paymentType === 'simple' ? SIMPLE_PAYMENT_METHODS : GENERAL_PAYMENT_METHODS;

  return (
    <Section>
      <SectionTitle>결제수단</SectionTitle>

      <TabContainer>
        <Tab
          $selected={paymentType === 'simple'}
          onClick={() => handlePaymentTypeChange('simple')}
        >
          간편결제
        </Tab>
        <Tab
          $selected={paymentType === 'general'}
          onClick={() => handlePaymentTypeChange('general')}
        >
          일반결제
        </Tab>
      </TabContainer>

      <MethodList>
        {methods.map(method => (
          <MethodItem
            key={method.value}
            onClick={() => setValue('paymentMethod', method.value)}
          >
            <RadioIcon>
              {paymentMethod === method.value ? (
                <CircleDot size={20} className="text-fg-primary" />
              ) : (
                <Circle size={20} className="text-fg-disabled" />
              )}
            </RadioIcon>
            <MethodLabel>{method.label}</MethodLabel>
          </MethodItem>
        ))}
      </MethodList>
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

const TabContainer = tw.div`
  bg-bg-layer-base
  rounded-xl
  flex
`;

const Tab = tw.button<{ $selected: boolean }>`
  flex-1
  h-11
  px-3
  rounded-xl
  text-base
  font-medium
  leading-5
  transition-colors
  ${({ $selected }) =>
    $selected
      ? 'bg-bg-neutral-subtle text-fg-neutral border-1 border-[var(--stroke-neutral)]'
      : 'text-fg-muted'}
`;

const MethodList = tw.div`
  flex
  flex-col
`;

const MethodItem = tw.button`
  h-11
  flex
  items-center
  gap-2
`;

const RadioIcon = tw.div`
  w-5
  h-5
  flex
  items-center
  justify-center
`;

const MethodLabel = tw.span`
  text-fg-neutral
  text-base
  font-normal
  leading-5
`;
