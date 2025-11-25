import { Calendar } from '@yestravelkr/min-design-system';
import { ConfigType } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

type DateRangeSelectModalProps = {
  checkInDate: ConfigType;
  checkOutDate: ConfigType;
};

export function DateRangeSelectModal(props: DateRangeSelectModalProps) {
  const { checkInDate, checkOutDate } = props;

  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(
    dayjs(checkInDate).format('YYYY-MM-DD')
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(
    dayjs(checkOutDate).format('YYYY-MM-DD')
  );

  const handleDateSelect = (
    checkIn: string | null,
    checkOut: string | null
  ) => {
    // checkIn이나 checkOut이 null이면 업데이트하지 않음
    if (checkIn === null || checkOut === null) {
      return;
    }
    setSelectedCheckIn(checkIn);
    setSelectedCheckOut(checkOut);
  };

  const handleReset = () => {
    setSelectedCheckIn(dayjs(checkInDate).format('YYYY-MM-DD'));
    setSelectedCheckOut(dayjs(checkOutDate).format('YYYY-MM-DD'));
  };

  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      SnappyModal.close({
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
      });
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>숙박 기간 설정</HeaderTitle>
        <ResetButton onClick={handleReset}>
          <IconWrapper>
            <div className="w-3.5 h-3 relative bg-[var(--fg-muted)]" />
          </IconWrapper>
          <ResetText>초기화</ResetText>
        </ResetButton>
      </Header>
      <CalendarWrapper>
        <Calendar
          defaultCheckInDate={selectedCheckIn}
          defaultCheckOutDate={selectedCheckOut}
          onDateSelect={handleDateSelect}
        />
      </CalendarWrapper>
      <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
    </Container>
  );
}

export function openDateRangeSelectModal(props: DateRangeSelectModalProps) {
  return SnappyModal.show(<DateRangeSelectModal {...props} />, {
    position: 'bottom-center',
  });
}

const Container = tw.div`
  self-stretch
  h-[542px]
  w-screen
  p-5
  bg-white
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
`;

const IconWrapper = tw.div`
  flex
  justify-start
  items-center
  gap-2.5
  overflow-hidden
  w-5
  h-5
  relative
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
`;
