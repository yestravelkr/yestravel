/**
 * HotelProductComponent - 호텔 상품 표시 컴포넌트
 *
 * 호텔 타입 상품을 표시하는 컴포넌트입니다.
 * 체크인/체크아웃 날짜 선택, 호텔 옵션 선택, 가격 계산 등을 처리합니다.
 */

import dayjs from 'dayjs';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { openDateRangeSelectModal } from './DateRangeSelectModal';

export function HotelProductComponent() {
  const [checkInDate, setCheckInDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

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

  return (
    <>
      <SelectedDates onClick={handleOpenDateRangeModal}>
        체크인: {checkInDate} / 체크아웃: {checkOutDate}
      </SelectedDates>
      <Container>
        <ProductTitle>호텔 상품</ProductTitle>

        {/* TODO: 호텔 상품 상세 정보 표시 */}
        {/* TODO: 호텔 옵션 선택 */}
        {/* TODO: 가격 계산 및 표시 */}
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
