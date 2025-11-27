/**
 * DateRangePickerModal - 날짜 범위 선택 모달
 *
 * 시작일과 종료일을 선택할 수 있는 캘린더 모달입니다.
 */

import { Calendar } from '@yestravelkr/min-design-system';
import { ConfigType } from 'dayjs';
import dayjs from 'dayjs';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

type DateRangePickerModalProps = {
  startDate: ConfigType;
  endDate: ConfigType;
};

export function DateRangePickerModal(props: DateRangePickerModalProps) {
  const { startDate, endDate } = props;
  const { resolveModal } = useCurrentModal();

  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    dayjs(startDate).format('YYYY-MM-DD'),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(
    dayjs(endDate).format('YYYY-MM-DD'),
  );

  const handleDateSelect = (
    checkIn: string | null,
    checkOut: string | null,
  ) => {
    if (checkIn === null || checkOut === null) {
      return;
    }
    setSelectedStartDate(checkIn);
    setSelectedEndDate(checkOut);
  };

  const handleReset = () => {
    setSelectedStartDate(dayjs(startDate).format('YYYY-MM-DD'));
    setSelectedEndDate(dayjs(endDate).format('YYYY-MM-DD'));
  };

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      resolveModal({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>날짜 범위 선택</HeaderTitle>
        <ResetButton onClick={handleReset}>
          <RotateCcw size={20} className="text-[var(--fg-muted)]" />
          <ResetText>초기화</ResetText>
        </ResetButton>
      </Header>
      <CalendarWrapper>
        <Calendar
          defaultCheckInDate={selectedStartDate}
          defaultCheckOutDate={selectedEndDate}
          onDateSelect={handleDateSelect}
        />
      </CalendarWrapper>
      <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
    </Container>
  );
}

export function openDateRangePickerModal(
  props: DateRangePickerModalProps,
): Promise<{ startDate: string; endDate: string } | null> {
  return SnappyModal.show(<DateRangePickerModal {...props} />, {
    position: 'center',
  });
}

const Container = tw.div`
  w-[480px]
  p-5
  bg-white
  rounded-[20px]
  inline-flex
  flex-col
  justify-start
  items-center
  gap-5
`;

const Header = tw.div`
  self-stretch
  px-3
  py-2
  inline-flex
  justify-start
  items-center
  gap-2.5
`;

const HeaderTitle = tw.div`
  flex-1
  justify-start
  text-[var(--fg-muted)]
  text-base
  font-medium
  leading-5
`;

const ResetButton = tw.button`
  flex
  justify-center
  items-center
  gap-1
  cursor-pointer
  hover:opacity-80
  transition-opacity
`;

const ResetText = tw.div`
  justify-start
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const CalendarWrapper = tw.div`
  self-stretch
  p-1
  flex
  flex-col
  justify-start
  items-start
  gap-1
`;

const ConfirmButton = tw.button`
  self-stretch
  h-12
  px-4
  bg-[var(--bg-neutral-solid)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-on-surface)]
  text-base
  font-medium
  leading-5
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;

/**
 * Usage:
 *
 * openDateRangePickerModal({
 *   startDate: '2025-01-01',
 *   endDate: '2025-02-28',
 * }).then(result => {
 *   if (result) {
 *     console.log('Start:', result.startDate);
 *     console.log('End:', result.endDate);
 *   }
 * });
 */
