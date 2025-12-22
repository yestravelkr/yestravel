/**
 * HotelOptionBottomSheet - 호텔 옵션 선택 바텀시트
 *
 * 호텔 상품의 날짜 선택 → 옵션 선택 → 확인 3단계 플로우를 처리합니다.
 * react-snappy-modal을 사용하여 바텀시트로 표시됩니다.
 */

import {
  Calendar,
  Select,
  type SelectOption,
} from '@yestravelkr/min-design-system';
import type { HotelOptionSelectorConfig } from '@yestravelkr/option-selector';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

dayjs.locale('ko');

export interface HotelOptionResult {
  checkInDate: string;
  checkOutDate: string;
  selectedOptionId: number;
  totalPrice: number;
}

interface HotelOptionBottomSheetProps {
  config: HotelOptionSelectorConfig;
  initialCheckInDate: string;
  initialCheckOutDate: string;
  initialOptionId: number | null;
}

type Step = 'date' | 'option' | 'confirm';

function HotelOptionBottomSheet({
  config,
  initialCheckInDate,
  initialCheckOutDate,
  initialOptionId,
}: HotelOptionBottomSheetProps) {
  const { resolveModal } = useCurrentModal();

  const [step, setStep] = useState<Step>('date');
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    initialOptionId
  );
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = useState(false);

  // 숙박 일수 계산
  const stayNights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');

  // 선택된 옵션의 총 가격 계산
  const calculateTotalPrice = (): number => {
    if (!selectedOptionId) return 0;
    const option = config.hotelOptions.find(opt => opt.id === selectedOptionId);
    if (!option) return 0;

    let total = 0;
    let currentDate = dayjs(checkInDate);
    const endDate = dayjs(checkOutDate);

    while (currentDate.isBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      total += option.priceByDate[dateStr] || 0;
      currentDate = currentDate.add(1, 'day');
    }

    return total;
  };

  const totalPrice = calculateTotalPrice();
  const selectedOption = config.hotelOptions.find(
    opt => opt.id === selectedOptionId
  );

  // 날짜 선택 핸들러
  const handleDateSelect = (
    checkIn: string | null,
    checkOut: string | null
  ) => {
    if (checkIn) setCheckInDate(checkIn);
    if (checkOut) setCheckOutDate(checkOut);
  };

  // 날짜 선택 완료 후 다음 단계로
  const handleDateNext = () => {
    if (checkInDate && checkOutDate) {
      setIsOptionDropdownOpen(true);
      setStep('option');
    }
  };

  // 옵션 선택 시 확인 단계로
  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
    setIsOptionDropdownOpen(false);
    setStep('confirm');
  };

  // 옵션 변경 (처음부터 다시)
  const handleChangeOption = () => {
    setSelectedOptionId(null);
    setStep('date');
  };

  // 구매하기
  const handlePurchase = () => {
    if (selectedOptionId) {
      resolveModal({
        checkInDate,
        checkOutDate,
        selectedOptionId,
        totalPrice,
      });
    }
  };

  // 닫기
  const handleClose = () => {
    resolveModal(null);
  };

  return (
    <Overlay onClick={handleClose}>
      <BottomSheetContainer
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <HandleWrapper>
          <Handle />
        </HandleWrapper>

        {/* Step 1: 날짜 선택 */}
        {step === 'date' && (
          <DateSelectStep
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            stayNights={stayNights}
            onDateSelect={handleDateSelect}
            onNext={handleDateNext}
          />
        )}

        {/* Step 2: 옵션 선택 */}
        {step === 'option' && (
          <OptionSelectStep
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            stayNights={stayNights}
            selectOptions={config.hotelOptions.map(option => {
              let total = 0;
              let currentDate = dayjs(checkInDate);
              const endDate = dayjs(checkOutDate);
              while (currentDate.isBefore(endDate)) {
                const dateStr = currentDate.format('YYYY-MM-DD');
                total += option.priceByDate[dateStr] || 0;
                currentDate = currentDate.add(1, 'day');
              }
              return {
                value: option.id,
                label: option.name,
                price: total,
                stockText: '예약 가능',
              };
            })}
            isDropdownOpen={isOptionDropdownOpen}
            onOpenChange={setIsOptionDropdownOpen}
            onSelectOption={handleOptionSelect}
          />
        )}

        {/* Step 3: 확인 */}
        {step === 'confirm' && selectedOption && (
          <ConfirmStep
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            stayNights={stayNights}
            optionName={selectedOption.name}
            totalPrice={totalPrice}
            onChangeOption={handleChangeOption}
            onPurchase={handlePurchase}
          />
        )}
      </BottomSheetContainer>
    </Overlay>
  );
}

/**
 * Step 1: 날짜 선택 컴포넌트
 */
interface DateSelectStepProps {
  checkInDate: string;
  checkOutDate: string;
  stayNights: number;
  onDateSelect: (checkIn: string | null, checkOut: string | null) => void;
  onNext: () => void;
}

function DateSelectStep({
  checkInDate,
  checkOutDate,
  stayNights,
  onDateSelect,
  onNext,
}: DateSelectStepProps) {
  return (
    <>
      <StepContent>
        {/* 날짜 표시 입력 필드 */}
        <DateInputField $focused>
          <DateInputIcon>
            <CalendarIcon size={16} />
          </DateInputIcon>
          <DateInputText>
            {dayjs(checkInDate).format('MM.DD(ddd)')} ~{' '}
            {dayjs(checkOutDate).format('MM.DD(ddd)')} / {stayNights}박
          </DateInputText>
          <DateInputIcon>
            <ChevronDown size={16} />
          </DateInputIcon>
        </DateInputField>

        {/* 캘린더 (min-design-system) */}
        <CalendarContainer>
          <Calendar
            containerClassName={'w-full'}
            defaultCheckInDate={checkInDate}
            defaultCheckOutDate={checkOutDate}
            onDateSelect={onDateSelect}
            minDate={dayjs().format('YYYY-MM-DD')}
          />
        </CalendarContainer>
      </StepContent>

      <StepFooter>
        <PrimaryButton onClick={onNext}>다음</PrimaryButton>
      </StepFooter>
    </>
  );
}

/**
 * Step 2: 옵션 선택 컴포넌트
 */
interface OptionSelectStepProps {
  checkInDate: string;
  checkOutDate: string;
  stayNights: number;
  selectOptions: SelectOption<number>[];
  isDropdownOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectOption: (optionId: number) => void;
}

function OptionSelectStep({
  checkInDate,
  checkOutDate,
  stayNights,
  selectOptions,
  isDropdownOpen,
  onOpenChange,
  onSelectOption,
}: OptionSelectStepProps) {
  return (
    <StepContent>
      {/* 날짜 표시 (읽기 전용) */}
      <DateInputField>
        <DateInputIcon>
          <CalendarIcon size={16} />
        </DateInputIcon>
        <DateInputText>
          {dayjs(checkInDate).format('MM.DD(ddd)')} ~{' '}
          {dayjs(checkOutDate).format('MM.DD(ddd)')} / {stayNights}박
        </DateInputText>
        <DateInputIcon>
          <ChevronDown size={16} />
        </DateInputIcon>
      </DateInputField>

      {/* 옵션 선택 (min-design-system Select) */}
      <Select
        options={selectOptions}
        onSelect={onSelectOption}
        placeholder="옵션"
        isOpen={isDropdownOpen}
        onOpenChange={onOpenChange}
      />
    </StepContent>
  );
}

/**
 * Step 3: 확인 컴포넌트
 */
interface ConfirmStepProps {
  checkInDate: string;
  checkOutDate: string;
  stayNights: number;
  optionName: string;
  totalPrice: number;
  onChangeOption: () => void;
  onPurchase: () => void;
}

function ConfirmStep({
  checkInDate,
  checkOutDate,
  stayNights,
  optionName,
  totalPrice,
  onChangeOption,
  onPurchase,
}: ConfirmStepProps) {
  return (
    <>
      <StepContent>
        {/* 옵션 변경 버튼 */}
        <ChangeOptionButton onClick={onChangeOption}>
          옵션 변경
        </ChangeOptionButton>

        {/* 선택된 옵션 요약 */}
        <SelectedOptionSummary>
          <SummaryCard>
            <SummaryContent>
              <SummaryDateText>
                {dayjs(checkInDate).format('YY.MM.DD(ddd)')} ~{' '}
                {dayjs(checkOutDate).format('YY.MM.DD(ddd)')} / {stayNights}박
              </SummaryDateText>
              <SummaryOptionText>{optionName}</SummaryOptionText>
            </SummaryContent>
          </SummaryCard>
        </SelectedOptionSummary>
      </StepContent>

      <StepFooter>
        <PriceRow>
          <PriceLabel>상품금액</PriceLabel>
          <PriceValue>{totalPrice.toLocaleString()}원</PriceValue>
        </PriceRow>
        <PrimaryButton onClick={onPurchase}>구매하기</PrimaryButton>
      </StepFooter>
    </>
  );
}

/**
 * 바텀시트를 여는 함수
 */
export function openHotelOptionBottomSheet(
  props: HotelOptionBottomSheetProps
): Promise<HotelOptionResult | null> {
  return SnappyModal.show(<HotelOptionBottomSheet {...props} />, {
    position: 'bottom-center',
  });
}

// Styled Components
const Overlay = tw.div`
  fixed
  inset-0
  bg-black/40
  flex
  flex-col
  justify-end
  items-center
  z-50
`;

const BottomSheetContainer = tw.div`
  w-full
  max-w-[600px]
  max-h-[85vh]
  min-h-[50vh]
  bg-bg-layer
  rounded-t-[32px]
  flex
  flex-col
  overflow-hidden
`;

const HandleWrapper = tw.div`
  px-5
  pt-3
  bg-white
  flex
  flex-col
  items-center
`;

const Handle = tw.div`
  w-12
  h-1
  bg-stroke-neutral
  rounded-sm
`;

const StepContent = tw.div`
  flex-1
  p-5
  bg-white
  flex
  flex-col
  gap-5
  overflow-auto
`;

const StepFooter = tw.div`
  p-5
  bg-white
  border-t
  border-[var(--stroke-neutral)]
  flex
  flex-col
  gap-5
`;

const DateInputField = tw.div<{ $focused?: boolean }>`
  h-11
  px-3
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  flex
  items-center
  gap-1
  ${({ $focused }) =>
    $focused
      ? 'outline-[var(--stroke-primary)]'
      : 'outline-[var(--stroke-neutral)]'}
`;

const DateInputIcon = tw.div`
  w-5
  h-5
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const DateInputText = tw.div`
  flex-1
  px-1
  text-fg-neutral
  text-base
  font-normal
  leading-5
`;

const CalendarContainer = tw.div`
  flex-1
  bg-bg-neutral-subtle
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  overflow-auto
  p-3
`;

const ChangeOptionButton = tw.button`
  h-11
  px-3
  bg-bg-neutral
  rounded-xl
  text-fg-neutral
  text-base
  font-medium
  leading-5
  hover:bg-bg-neutral-subtle
  transition-colors
`;

const SelectedOptionSummary = tw.div`
  flex
  flex-col
  gap-2
`;

const SummaryCard = tw.div`
  p-1
  bg-bg-neutral-subtle
  rounded-xl
  outline
  outline-1
  outline-[var(--stroke-neutral)]
`;

const SummaryContent = tw.div`
  p-3
  flex
  flex-col
  gap-1
`;

const SummaryDateText = tw.div`
  text-fg-neutral
  text-base
  font-medium
  leading-5
`;

const SummaryOptionText = tw.div`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const PriceRow = tw.div`
  flex
  items-center
  gap-1
`;

const PriceLabel = tw.div`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const PriceValue = tw.div`
  flex-1
  text-right
  text-fg-critical
  text-xl
  font-bold
  leading-7
`;

const PrimaryButton = tw.button`
  w-full
  h-12
  px-4
  bg-bg-neutral-solid
  rounded-xl
  text-fg-on-surface
  text-base
  font-medium
  leading-5
  hover:opacity-90
  transition-opacity
`;
