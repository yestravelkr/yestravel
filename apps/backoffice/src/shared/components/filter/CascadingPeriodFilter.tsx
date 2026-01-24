/**
 * CascadingPeriodFilter - 계단식 기간 필터 컴포넌트
 *
 * 3단계로 구성된 기간 필터입니다.
 * 1단계: 기간 타입 선택 (결제일/주문일/이용일)
 * 2단계: 프리셋 선택 (최근7일/1개월/3개월/직접입력) + 초기화
 * 3단계: 직접입력 시 캘린더 표시
 */

import { Calendar } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

type Step = 'closed' | 'selectType' | 'selectPreset' | 'calendar';

export interface PeriodTypeOption {
  value: string;
  label: string;
}

export interface PeriodPresetOption {
  value: string;
  label: string;
}

export interface PeriodFilterValues {
  periodType: string;
  periodPreset: string;
  startDate: string;
  endDate: string;
}

export interface CascadingPeriodFilterProps {
  /** 기간 타입 옵션 목록 */
  periodTypeOptions: PeriodTypeOption[];
  /** 프리셋 옵션 목록 */
  periodPresetOptions: PeriodPresetOption[];
  /** 현재 값 */
  value: PeriodFilterValues;
  /** 값 변경 콜백 */
  onChange: (values: PeriodFilterValues) => void;
}

/**
 * Usage:
 *
 * <CascadingPeriodFilter
 *   periodTypeOptions={[
 *     { value: 'payment', label: '결제일' },
 *     { value: 'order', label: '주문일' },
 *     { value: 'usage', label: '이용일' },
 *   ]}
 *   periodPresetOptions={[
 *     { value: '7days', label: '최근 7일' },
 *     { value: '1month', label: '최근 1개월' },
 *     { value: '3months', label: '최근 3개월' },
 *   ]}
 *   value={{ periodType: 'payment', periodPreset: '7days', startDate: '...', endDate: '...' }}
 *   onChange={(values) => setFilterValues(values)}
 * />
 */
export function CascadingPeriodFilter({
  periodTypeOptions,
  periodPresetOptions,
  value,
  onChange,
}: CascadingPeriodFilterProps) {
  const [step, setStep] = useState<Step>('closed');
  const [tempType, setTempType] = useState<string>(value.periodType);
  const [calendarStartDate, setCalendarStartDate] = useState<string | null>(
    value.startDate,
  );
  const [calendarEndDate, setCalendarEndDate] = useState<string | null>(
    value.endDate,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTypeLabel =
    periodTypeOptions.find((opt) => opt.value === value.periodType)?.label ||
    '기간';

  const selectedPresetLabel =
    periodPresetOptions.find((opt) => opt.value === value.periodPreset)
      ?.label || '';

  // 선택 여부
  const hasSelection = !!value.periodPreset;

  // 표시 텍스트: "이용일: 최근 7일" 형식
  const displayLabel =
    value.periodPreset === 'custom'
      ? `${selectedTypeLabel}: ${dayjs(value.startDate).format('YY.MM.DD')} - ${dayjs(value.endDate).format('YY.MM.DD')}`
      : selectedPresetLabel
        ? `${selectedTypeLabel}: ${selectedPresetLabel}`
        : '기간';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setStep('closed');
      }
    };

    if (step !== 'closed') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [step]);

  const handleTriggerClick = () => {
    setStep(step === 'closed' ? 'selectType' : 'closed');
  };

  const handleClear = () => {
    onChange({
      periodType: '',
      periodPreset: '',
      startDate: '',
      endDate: '',
    });
    setTempType(periodTypeOptions[0]?.value || '');
  };

  const handleTypeSelect = (typeValue: string) => {
    setTempType(typeValue);
    setStep('selectPreset');
  };

  const handlePresetSelect = (presetValue: string) => {
    if (presetValue === 'custom') {
      // 직접입력 선택 시 캘린더로 이동
      setCalendarStartDate(value.startDate);
      setCalendarEndDate(value.endDate);
      setStep('calendar');
      return;
    }

    // 프리셋 선택 시 날짜 계산 후 적용
    const today = dayjs();
    let startDate = value.startDate;
    const endDate = today.format('YYYY-MM-DD');

    switch (presetValue) {
      case 'today':
        startDate = today.format('YYYY-MM-DD');
        break;
      case '7days':
        startDate = today.subtract(6, 'day').format('YYYY-MM-DD');
        break;
      case '1month':
        startDate = today.subtract(1, 'month').format('YYYY-MM-DD');
        break;
      case '2months':
        startDate = today.subtract(2, 'month').format('YYYY-MM-DD');
        break;
      case '3months':
        startDate = today.subtract(3, 'month').format('YYYY-MM-DD');
        break;
    }

    onChange({
      periodType: tempType,
      periodPreset: presetValue,
      startDate,
      endDate,
    });
    setStep('closed');
  };

  const handleReset = () => {
    const today = dayjs();
    const defaultValues: PeriodFilterValues = {
      periodType: periodTypeOptions[0]?.value || 'payment',
      periodPreset: '7days',
      startDate: today.subtract(6, 'day').format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD'),
    };
    onChange(defaultValues);
    setTempType(defaultValues.periodType);
    setStep('closed');
  };

  const handleBackToType = () => {
    setStep('selectType');
  };

  const handleCalendarDateSelect = (
    checkIn: string | null,
    checkOut: string | null,
  ) => {
    setCalendarStartDate(checkIn);
    setCalendarEndDate(checkOut);
  };

  const handleCalendarConfirm = () => {
    if (calendarStartDate && calendarEndDate) {
      onChange({
        periodType: tempType,
        periodPreset: 'custom',
        startDate: calendarStartDate,
        endDate: calendarEndDate,
      });
      setStep('closed');
    }
  };

  const tempTypeLabel =
    periodTypeOptions.find((opt) => opt.value === tempType)?.label || '기간';

  return (
    <Container ref={containerRef}>
      <Trigger
        onClick={handleTriggerClick}
        $isOpen={step !== 'closed'}
        $selected={hasSelection}
      >
        <TriggerText $selected={hasSelection}>{displayLabel}</TriggerText>
        {hasSelection ? (
          <ClearButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleClear();
            }}
            type="button"
          >
            <X size={14} />
          </ClearButton>
        ) : (
          <IconWrapper $isOpen={step !== 'closed'} $selected={hasSelection}>
            <ChevronDown size={16} />
          </IconWrapper>
        )}
      </Trigger>

      {step !== 'closed' && (
        <DropdownMenu $wide={step === 'calendar'}>
          {/* Step 1: 기간 타입 선택 */}
          {step === 'selectType' && (
            <MenuContent>
              {periodTypeOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleTypeSelect(option.value)}
                >
                  <span>{option.label}</span>
                  <ChevronRight size={16} className="text-[var(--fg-muted)]" />
                </MenuItem>
              ))}
            </MenuContent>
          )}

          {/* Step 2: 프리셋 선택 */}
          {step === 'selectPreset' && (
            <MenuContent>
              <MenuHeader>
                <BackButton onClick={handleBackToType}>
                  <ChevronLeft size={16} />
                </BackButton>
                <MenuTitle>{tempTypeLabel}</MenuTitle>
                <ResetButton onClick={handleReset}>
                  <RotateCcw size={14} />
                  <span>초기화</span>
                </ResetButton>
              </MenuHeader>
              <MenuDivider />
              {periodPresetOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handlePresetSelect(option.value)}
                  $selected={
                    value.periodType === tempType &&
                    value.periodPreset === option.value
                  }
                >
                  <span>{option.label}</span>
                  {option.value === 'custom' && (
                    <ChevronRight
                      size={16}
                      className="text-[var(--fg-muted)]"
                    />
                  )}
                </MenuItem>
              ))}
            </MenuContent>
          )}

          {/* Step 3: 캘린더 */}
          {step === 'calendar' && (
            <CalendarContent>
              <MenuHeader>
                <BackButton onClick={() => setStep('selectPreset')}>
                  <ChevronLeft size={16} />
                </BackButton>
                <MenuTitle>{tempTypeLabel}</MenuTitle>
                <ResetButton onClick={handleReset}>
                  <RotateCcw size={14} />
                  <span>초기화</span>
                </ResetButton>
              </MenuHeader>
              <MenuDivider />
              <CalendarWrapper>
                <Calendar
                  defaultCheckInDate={calendarStartDate}
                  defaultCheckOutDate={calendarEndDate}
                  onDateSelect={handleCalendarDateSelect}
                />
              </CalendarWrapper>
              <ConfirmButton onClick={handleCalendarConfirm}>
                확인
              </ConfirmButton>
            </CalendarContent>
          )}
        </DropdownMenu>
      )}
    </Container>
  );
}

const Container = tw.div`
  relative
`;

const Trigger = tw.button<{ $isOpen?: boolean; $selected?: boolean }>`
  h-9
  px-2
  rounded-full
  inline-flex
  justify-center
  items-center
  gap-1
  cursor-pointer
  transition-all
  ${(p) =>
    p.$selected
      ? 'bg-[var(--bg-neutral-solid)]'
      : 'bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral-glass)]'}
`;

const TriggerText = tw.span<{ $selected?: boolean }>`
  text-sm
  font-normal
  whitespace-nowrap
  ${(p) => (p.$selected ? 'text-white' : 'text-[var(--fg-neutral)]')}
`;

const IconWrapper = tw.span<{ $isOpen?: boolean; $selected?: boolean }>`
  flex
  items-center
  justify-center
  transition-transform
  ${(p) => (p.$selected ? 'text-white' : 'text-[var(--fg-muted)]')}
  ${(p) => (p.$isOpen ? 'rotate-180' : '')}
`;

const ClearButton = tw.button`
  flex
  items-center
  justify-center
  text-white
  hover:text-white/80
  cursor-pointer
`;

const DropdownMenu = tw.div<{ $wide?: boolean }>`
  absolute
  top-[calc(100%+4px)]
  left-0
  ${(p) => (p.$wide ? 'min-w-[320px]' : 'min-w-[180px]')}
  bg-[var(--bg-layer)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  shadow-lg
  z-50
  overflow-hidden
`;

const MenuContent = tw.div`
  py-1
`;

const MenuHeader = tw.div`
  flex
  items-center
  gap-2
  px-3
  py-2
`;

const BackButton = tw.button`
  w-6
  h-6
  flex
  items-center
  justify-center
  text-[var(--fg-muted)]
  hover:text-[var(--fg-neutral)]
  hover:bg-[var(--bg-neutral-subtle)]
  rounded
  cursor-pointer
  transition-colors
`;

const MenuTitle = tw.span`
  flex-1
  text-sm
  font-medium
  text-[var(--fg-neutral)]
`;

const ResetButton = tw.button`
  flex
  items-center
  gap-1
  text-xs
  text-[var(--fg-muted)]
  hover:text-[var(--fg-neutral)]
  cursor-pointer
  transition-colors
`;

const MenuDivider = tw.div`
  h-px
  bg-[var(--stroke-neutral)]
  mx-2
  my-1
`;

const MenuItem = tw.button<{ $selected?: boolean }>`
  w-full
  px-3
  py-2
  text-sm
  font-normal
  text-left
  cursor-pointer
  transition-colors
  flex
  items-center
  justify-between
  ${(p) =>
    p.$selected
      ? 'text-[var(--fg-neutral)] bg-[var(--bg-neutral-subtle)]'
      : 'text-[var(--fg-neutral)] hover:bg-[var(--bg-neutral-subtle)]'}
`;

const CalendarContent = tw.div`
  p-3
`;

const CalendarWrapper = tw.div`
  py-2
`;

const ConfirmButton = tw.button`
  w-full
  h-10
  bg-[var(--bg-neutral-solid)]
  rounded-lg
  text-sm
  font-medium
  text-[var(--fg-on-surface)]
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;
