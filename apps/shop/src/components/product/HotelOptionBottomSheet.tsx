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
import {
  HotelOptionSelector,
  type HotelOptionSelectorConfig,
  type HotelOptionSelectorState,
} from '@yestravelkr/option-selector';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import 'dayjs/locale/ko';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared/trpc';

dayjs.extend(isSameOrAfter);
dayjs.locale('ko');

export interface HotelOptionResult {
  checkInDate: string;
  checkOutDate: string;
  selectedOptionId: number;
  totalPrice: number;
  orderNumber: string;
}

interface HotelOptionBottomSheetProps {
  saleId: number;
  config: HotelOptionSelectorConfig;
  initialCheckInDate: string;
  initialCheckOutDate: string;
  initialOptionId: number | null;
}

type Step = 'date' | 'option' | 'confirm';

function HotelOptionBottomSheet({
  saleId,
  config,
  initialCheckInDate,
  initialCheckOutDate,
  initialOptionId,
}: HotelOptionBottomSheetProps) {
  const { resolveModal } = useCurrentModal();
  const createOrderMutation = trpc.shopOrder.createHotelOrder.useMutation();

  const [step, setStep] = useState<Step>('date');
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    initialOptionId
  );
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = useState(false);

  // 선택 가능한 날짜 계산 (오늘 이후 + config에 있는 날짜 + 가격이 설정된 날짜)
  const today = dayjs().format('YYYY-MM-DD');

  // SKU에서 재고가 있는 날짜
  const skuAvailableDates = new Set(
    config.skus.filter(sku => sku.quantity > 0).map(sku => sku.date)
  );

  // 모든 옵션에 공통으로 가격이 설정된 날짜
  const priceAvailableDates = useMemo(() => {
    if (config.hotelOptions.length === 0) return new Set<string>();

    // 첫 번째 옵션의 날짜들로 시작
    const firstOptionDates = new Set(
      Object.keys(config.hotelOptions[0].priceByDate)
    );

    // 나머지 옵션들과 교집합
    for (let i = 1; i < config.hotelOptions.length; i++) {
      const optionDates = new Set(
        Object.keys(config.hotelOptions[i].priceByDate)
      );
      for (const date of firstOptionDates) {
        if (!optionDates.has(date)) {
          firstOptionDates.delete(date);
        }
      }
    }

    return firstOptionDates;
  }, [config.hotelOptions]);

  // SKU 재고 + 가격 설정 모두 충족하는 날짜만 선택 가능
  const availableDates = useMemo(() => {
    return Array.from(skuAvailableDates)
      .filter(date => priceAvailableDates.has(date))
      .sort();
  }, [skuAvailableDates, priceAvailableDates]);

  const configMinDate = availableDates[0];
  const maxDate = availableDates[availableDates.length - 1];
  // minDate는 config의 첫 날짜와 오늘 중 더 늦은 날짜
  const minDate = configMinDate > today ? configMinDate : today;

  // 선택 불가능한 날짜 목록 (minDate ~ maxDate 범위 내에서 availableDates에 없는 날짜)
  const disabledDates = useMemo(() => {
    if (!minDate || !maxDate) return [];

    const disabled: string[] = [];
    let current = dayjs(minDate);
    const end = dayjs(maxDate);
    const availableSet = new Set(availableDates);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      if (!availableSet.has(dateStr)) {
        disabled.push(dateStr);
      }
      current = current.add(1, 'day');
    }

    return disabled;
  }, [minDate, maxDate, availableDates]);

  // HotelOptionSelector 인스턴스 생성
  const hotelSelector = useMemo(() => {
    // 체크인이 체크아웃보다 이후인 경우 방어 로직
    const validCheckIn = checkInDate;
    let validCheckOut = checkOutDate;

    if (dayjs(validCheckIn).isSameOrAfter(dayjs(validCheckOut))) {
      validCheckOut = dayjs(validCheckIn).add(1, 'day').format('YYYY-MM-DD');
    }

    const state: HotelOptionSelectorState = {
      checkInDate: validCheckIn,
      checkOutDate: validCheckOut,
      selectedHotelOptionId: selectedOptionId,
    };
    return HotelOptionSelector.fromJSON(config, state);
  }, [config, checkInDate, checkOutDate, selectedOptionId]);

  // 숙박 일수
  const stayNights = hotelSelector.getStayNights();
  // 총 가격 (가격 데이터가 없는 날짜가 포함되면 undefined)
  const totalPrice = useMemo(() => {
    if (!selectedOptionId) return 0;
    try {
      return hotelSelector.getTotalPrice();
    } catch {
      return undefined;
    }
  }, [hotelSelector, selectedOptionId]);

  // 옵션별 가격 캐싱 (렌더링마다 HotelOptionSelector 생성 방지)
  const optionPrices = useMemo(() => {
    // 체크아웃이 체크인보다 이후가 아니면 빈 배열 반환 (유효하지 않은 날짜)
    if (dayjs(checkInDate).isSameOrAfter(dayjs(checkOutDate))) {
      return config.hotelOptions.map(option => ({
        id: option.id,
        name: option.name,
        price: undefined as number | undefined,
      }));
    }

    return config.hotelOptions.map(option => {
      try {
        const selector = HotelOptionSelector.fromJSON(config, {
          checkInDate,
          checkOutDate,
          selectedHotelOptionId: option.id,
        });
        return {
          id: option.id,
          name: option.name,
          price: selector.getTotalPrice() as number | undefined,
        };
      } catch {
        // 해당 날짜에 가격 데이터가 없는 경우
        return {
          id: option.id,
          name: option.name,
          price: undefined as number | undefined,
        };
      }
    });
  }, [config, checkInDate, checkOutDate]);

  const selectedOption = config.hotelOptions.find(
    opt => opt.id === selectedOptionId
  );

  // 날짜 선택 핸들러
  const handleDateSelect = (
    checkIn: string | null,
    checkOut: string | null
  ) => {
    if (checkIn) {
      setCheckInDate(checkIn);
      // 체크인이 체크아웃보다 이후이면 체크아웃을 체크인 + 1일로 자동 조정
      if (checkOut && dayjs(checkIn).isSameOrAfter(dayjs(checkOut))) {
        const newCheckOut = dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD');
        setCheckOutDate(newCheckOut);
      } else if (checkOut) {
        setCheckOutDate(checkOut);
      }
    } else if (checkOut) {
      setCheckOutDate(checkOut);
    }
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

  // Step 2에서 날짜 변경
  const handleBackToDateSelect = () => {
    setStep('date');
  };

  // 구매하기
  const handlePurchase = async () => {
    if (!selectedOptionId) return;

    try {
      const result = await createOrderMutation.mutateAsync({
        saleId,
        checkInDate,
        checkOutDate,
        optionId: selectedOptionId,
      });

      toast.success('주문이 생성되었습니다.');
      resolveModal({
        checkInDate,
        checkOutDate,
        selectedOptionId,
        totalPrice,
        orderNumber: result.orderNumber,
      });
    } catch (error) {
      toast.error('주문 생성에 실패했습니다.');
      console.error('주문 생성 실패:', error);
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
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
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
            selectOptions={optionPrices.map(option => ({
              value: option.id,
              label: option.name,
              price: option.price,
              stockText: '예약 가능',
            }))}
            isDropdownOpen={isOptionDropdownOpen}
            onOpenChange={setIsOptionDropdownOpen}
            onSelectOption={handleOptionSelect}
            onBackToDateSelect={handleBackToDateSelect}
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
  minDate: string;
  maxDate: string;
  disabledDates: string[];
  onDateSelect: (checkIn: string | null, checkOut: string | null) => void;
  onNext: () => void;
}

function DateSelectStep({
  checkInDate,
  checkOutDate,
  stayNights,
  minDate,
  maxDate,
  disabledDates,
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
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
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
  onBackToDateSelect: () => void;
}

function OptionSelectStep({
  checkInDate,
  checkOutDate,
  stayNights,
  selectOptions,
  isDropdownOpen,
  onOpenChange,
  onSelectOption,
  onBackToDateSelect,
}: OptionSelectStepProps) {
  return (
    <StepContent>
      {/* 날짜 표시 (클릭하면 Step 1로 돌아감) */}
      <DateInputField onClick={onBackToDateSelect} className="cursor-pointer">
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
  totalPrice: number | undefined;
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
          <PriceValue>
            {totalPrice !== undefined
              ? `${totalPrice.toLocaleString()}원`
              : '가격 정보 없음'}
          </PriceValue>
        </PriceRow>
        <PrimaryButton onClick={onPurchase} disabled={totalPrice === undefined}>
          구매하기
        </PrimaryButton>
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
  hover:bg-bg-neutral-subtle
  transition-colors
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
