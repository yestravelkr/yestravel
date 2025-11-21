/**
 * HotelProductComponent - 호텔 상품 표시 컴포넌트
 *
 * 호텔 타입 상품을 표시하는 컴포넌트입니다.
 * 체크인/체크아웃 날짜 선택, 호텔 옵션 선택, 가격 계산 등을 처리합니다.
 */

import { HotelOptionSelector } from '@yestravelkr/option-selector';
import type {
  HotelOptionSelectorConfig,
  HotelOptionSelectorState,
} from '@yestravelkr/option-selector';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import tw from 'tailwind-styled-components';

import { openDateRangeSelectModal } from './DateRangeSelectModal';

// 샘플 데이터: 호텔 옵션 선택기 설정
const SAMPLE_CONFIG: HotelOptionSelectorConfig = {
  // SKU: 2025-11-21부터 30일간의 재고 데이터
  skus: Array.from({ length: 30 }, (_, i) => {
    const date = dayjs('2025-11-21').add(i, 'day');
    return {
      id: i + 1,
      quantity: Math.floor(Math.random() * 5) + 1, // 1~5개 재고
      date: date.format('YYYY-MM-DD'),
    };
  }),

  // 호텔 옵션: 3가지 옵션 제공
  hotelOptions: [
    {
      id: 1,
      name: '기본 객실',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 150000 : 100000]; // 주말/평일 가격 차별화
        })
      ),
    },
    {
      id: 2,
      name: '조식 포함',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 180000 : 130000];
        })
      ),
    },
    {
      id: 3,
      name: '조식 + 레이트 체크아웃',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 220000 : 170000];
        })
      ),
    },
  ],
};

export function HotelProductComponent() {
  const [checkInDate, setCheckInDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // HotelOptionSelector 인스턴스 생성
  const hotelSelector = useMemo(() => {
    const state: HotelOptionSelectorState = {
      checkInDate,
      checkOutDate,
      selectedHotelOptionId: selectedOptionId,
    };
    return HotelOptionSelector.fromJSON(SAMPLE_CONFIG, state);
  }, [checkInDate, checkOutDate, selectedOptionId]);

  const handleOpenDateRangeModal = () => {
    openDateRangeSelectModal({
      checkInDate,
      checkOutDate,
    }).then(result => {
      if (result?.checkIn && result?.checkOut) {
        setCheckInDate(result.checkIn);
        setCheckOutDate(result.checkOut);
      }
    });
  };

  // 재고 확인
  const isAvailable = hotelSelector.validateAvailability();
  // 숙박 일수
  const stayNights = hotelSelector.getStayNights();
  // 총 가격
  const totalPrice = selectedOptionId ? hotelSelector.getTotalPrice() : 0;

  return (
    <>
      <SelectedDates onClick={handleOpenDateRangeModal}>
        체크인: {checkInDate} / 체크아웃: {checkOutDate} ({stayNights}박)
      </SelectedDates>
      <Container>
        <ProductTitle>호텔 상품</ProductTitle>

        {/* 재고 상태 */}
        <StatusText>
          {isAvailable ? '예약 가능' : '예약 불가 (재고 부족)'}
        </StatusText>

        {/* 호텔 옵션 선택 */}
        <OptionsSection>
          <SectionTitle>옵션 선택</SectionTitle>
          {SAMPLE_CONFIG.hotelOptions.map(option => (
            <OptionButton
              key={option.id}
              $selected={selectedOptionId === option.id}
              onClick={() => setSelectedOptionId(option.id)}
            >
              {option.name}
            </OptionButton>
          ))}
        </OptionsSection>

        {/* 가격 표시 */}
        {selectedOptionId && (
          <PriceSection>
            <PriceLabel>총 요금</PriceLabel>
            <PriceValue>{totalPrice.toLocaleString()}원</PriceValue>
          </PriceSection>
        )}

        {/* TODO: 예약하기 버튼 */}
      </Container>
    </>
  );
}

/**
 * Usage:
 *
 * <HotelProductComponent />
 */

// Styled Components
const Container = tw.div`
  flex
  flex-col
  gap-4
  p-5
`;

const ProductTitle = tw.h1`
  text-2xl
  font-bold
  text-fg-neutral
`;

const SelectedDates = tw.div`
  text-base
  text-fg-neutral
  p-4
  bg-bg-neutral
  rounded-xl
  cursor-pointer
  hover:bg-bg-layer-base
  transition-colors
`;

const StatusText = tw.div`
  text-sm
  text-fg-muted
  p-3
  bg-bg-layer-base
  rounded-lg
`;

const OptionsSection = tw.div`
  flex
  flex-col
  gap-2
`;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-fg-neutral
  mb-2
`;

const OptionButton = tw.button<{ $selected: boolean }>`
  p-4
  rounded-xl
  border
  transition-all
  ${({ $selected }) =>
    $selected
      ? 'bg-bg-neutral-solid text-fg-on-surface border-bg-neutral-solid'
      : 'bg-white text-fg-neutral border-border-neutral hover:bg-bg-neutral'}
`;

const PriceSection = tw.div`
  flex
  justify-between
  items-center
  p-4
  bg-bg-layer-base
  rounded-xl
  mt-4
`;

const PriceLabel = tw.span`
  text-base
  font-medium
  text-fg-neutral
`;

const PriceValue = tw.span`
  text-xl
  font-bold
  text-fg-neutral
`;
