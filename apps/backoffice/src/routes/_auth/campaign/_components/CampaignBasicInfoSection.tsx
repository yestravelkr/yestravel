/**
 * CampaignBasicInfoSection - 캠페인 기본정보 섹션
 *
 * 캠페인명과 캠페인 기간을 입력하는 섹션입니다.
 */

import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type { CampaignFormData } from './types';

import { Input, FieldWrapper } from '@/shared/components';
import { openDateRangePickerModal } from '@/shared/components/DateRangePickerModal';

export function CampaignBasicInfoSection() {
  const { control } = useFormContext<CampaignFormData>();
  const handleDateRangeClick = async (
    startDate: string,
    endDate: string,
    onChange: (value: { startDate: string; endDate: string }) => void,
  ) => {
    const result = await openDateRangePickerModal({ startDate, endDate });
    if (result) {
      onChange({ startDate: result.startDate, endDate: result.endDate });
    }
  };

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>기본정보</SectionTitle>
      </SectionHeader>
      <SectionContent>
        <FormGrid>
          <Controller
            name="title"
            control={control}
            rules={{ required: '캠페인명을 입력해주세요' }}
            render={({ field, fieldState }) => (
              <FieldWrapper
                label="캠페인명"
                isEditMode={true}
                required
                error={fieldState.error?.message}
              >
                <Input
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="캠페인명을 입력하세요"
                />
              </FieldWrapper>
            )}
          />

          <Controller
            name="dateRange"
            control={control}
            rules={{ required: '캠페인 기간을 선택해주세요' }}
            render={({ field, fieldState }) => (
              <FieldWrapper
                label="캠페인 기간"
                isEditMode={true}
                required
                error={fieldState.error?.message}
              >
                <DateRangeButton
                  type="button"
                  onClick={() =>
                    handleDateRangeClick(
                      field.value.startDate,
                      field.value.endDate,
                      field.onChange,
                    )
                  }
                >
                  <CalendarIcon size={20} />
                  <span>
                    {dayjs(field.value.startDate).format('YYYY.MM.DD')} -{' '}
                    {dayjs(field.value.endDate).format('YYYY.MM.DD')}
                  </span>
                </DateRangeButton>
              </FieldWrapper>
            )}
          />
        </FormGrid>
      </SectionContent>
    </FormSection>
  );
}

const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-[var(--stroke-neutral)]
  overflow-hidden
`;

const SectionHeader = tw.div`
  px-6
  py-4
  border-b
  border-[var(--stroke-neutral)]
  flex
  justify-between
  items-center
`;

const SectionTitle = tw.h2`
  text-base
  font-semibold
  text-[var(--fg-neutral)]
`;

const SectionContent = tw.div`
  p-6
`;

const FormGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  gap-4
`;

const DateRangeButton = tw.button`
  px-4
  py-2
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  text-sm
  flex
  items-center
  gap-2
  text-[var(--fg-neutral)]
  hover:bg-[var(--bg-subtle)]
  transition-colors
  w-full
  justify-start
`;

/**
 * Usage:
 *
 * <FormProvider {...methods}>
 *   <CampaignBasicInfoSection />
 * </FormProvider>
 */
