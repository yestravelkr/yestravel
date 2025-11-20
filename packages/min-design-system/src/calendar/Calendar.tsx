/**
 * Calendar - 날짜 선택 컴포넌트
 *
 * 체크인/체크아웃 날짜를 선택할 수 있는 달력 컴포넌트입니다.
 * 날짜 범위 선택을 지원하며, 월 단위로 이동할 수 있습니다.
 */

import { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import tw from 'tailwind-styled-components';

export interface CalendarProps {
  /** 선택된 체크인 날짜 (YYYY-MM-DD) */
  checkInDate?: string | null;
  /** 선택된 체크아웃 날짜 (YYYY-MM-DD) */
  checkOutDate?: string | null;
  /** 날짜 선택 시 호출되는 콜백 */
  onDateSelect?: (checkIn: string | null, checkOut: string | null) => void;
  /** 선택 불가능한 날짜들 (YYYY-MM-DD[]) */
  disabledDates?: string[];
  /** 최소 선택 가능 날짜 (YYYY-MM-DD) */
  minDate?: string;
  /** 최대 선택 가능 날짜 (YYYY-MM-DD) */
  maxDate?: string;
}

export function Calendar({
  checkInDate,
  checkOutDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const handleDateClick = (date: string) => {
    if (!onDateSelect) return;

    // 선택 불가능한 날짜 체크
    if (disabledDates.includes(date)) return;
    if (minDate && dayjs(date).isBefore(dayjs(minDate))) return;
    if (maxDate && dayjs(date).isAfter(dayjs(maxDate))) return;

    // 체크인 날짜가 없으면 체크인 설정
    if (!checkInDate) {
      onDateSelect(date, null);
      return;
    }

    // 체크인 날짜만 있으면 체크아웃 설정
    if (!checkOutDate) {
      if (dayjs(date).isBefore(dayjs(checkInDate))) {
        // 체크인보다 이전 날짜를 선택하면 체크인을 다시 설정
        onDateSelect(date, null);
      } else {
        onDateSelect(checkInDate, date);
      }
      return;
    }

    // 둘 다 있으면 초기화하고 새로 시작
    onDateSelect(date, null);
  };

  const calendarDates = useMemo(() => {
    const startDate = currentMonth.startOf('month').startOf('week');
    const endDate = currentMonth.endOf('month').endOf('week');

    const dates: Dayjs[] = [];
    let date = startDate;

    while (date.isBefore(endDate) || date.isSame(endDate, 'day')) {
      dates.push(date);
      date = date.add(1, 'day');
    }

    return dates;
  }, [currentMonth]);

  return (
    <Container>
      <Header>
        <IconButton onClick={handlePrevMonth} type="button">
          <Icon>
            <ArrowLeft />
          </Icon>
        </IconButton>
        <MonthTitle>{currentMonth.format('YYYY.MM')}</MonthTitle>
        <IconButton onClick={handleNextMonth} type="button">
          <Icon>
            <ArrowRight />
          </Icon>
        </IconButton>
      </Header>

      <WeekHeader>
        <WeekDayLabel>일</WeekDayLabel>
        <WeekDayLabel>월</WeekDayLabel>
        <WeekDayLabel>화</WeekDayLabel>
        <WeekDayLabel>수</WeekDayLabel>
        <WeekDayLabel>목</WeekDayLabel>
        <WeekDayLabel>금</WeekDayLabel>
        <WeekDayLabel>토</WeekDayLabel>
      </WeekHeader>

      <CalendarGrid>
        {calendarDates.map((dayDate) => {
          const dateStr = dayDate.format('YYYY-MM-DD');
          const isCurrentMonth = dayDate.isSame(currentMonth, 'month');
          const isDisabled =
            disabledDates.includes(dateStr) ||
            (minDate && dayDate.isBefore(dayjs(minDate))) ||
            (maxDate && dayDate.isAfter(dayjs(maxDate)));
          const isCheckIn = checkInDate === dateStr;
          const isCheckOut = checkOutDate === dateStr;
          const isInRange =
            checkInDate &&
            checkOutDate &&
            dayDate.isAfter(dayjs(checkInDate)) &&
            dayDate.isBefore(dayjs(checkOutDate));

          let variant: 'ghost' | 'subtle' | 'solid' = 'ghost';
          if (isCheckIn || isCheckOut) {
            variant = 'solid';
          } else if (isInRange) {
            variant = 'subtle';
          }

          return (
              <DayButton
                key={dateStr}
                onClick={() => !isDisabled && isCurrentMonth && handleDateClick(dateStr)}
                $variant={variant}
                $isCurrentMonth={isCurrentMonth}
                $isDisabled={isDisabled}
                type="button"
              >
                <DayLabel $isCurrentMonth={isCurrentMonth}>{dayDate.date()}</DayLabel>
              </DayButton>
          );
        })}
      </CalendarGrid>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  self-stretch
  p-1
  inline-flex
  flex-col
  justify-start
  items-start
  gap-1
`;

const Header = tw.div`
  self-stretch
  inline-flex
  justify-between
  items-center
`;

const IconButton = tw.button`
  w-9
  h-9
  bg-bg-neutral
  rounded-xl
  flex
  justify-center
  items-center
  cursor-pointer
  hover:bg-bg-neutral-hover
  transition-colors
`;

const Icon = tw.div`
  h-5
  flex
  justify-start
  items-center
  gap-2.5
  overflow-hidden
`;

const ArrowLeft = tw.div`
  w-2
  h-3
  bg-fg-neutral
  clip-path-[polygon(100%_0,_0_50%,_100%_100%)]
`;

const ArrowRight = tw.div`
  w-2
  h-3
  bg-fg-neutral
  clip-path-[polygon(0_0,_100%_50%,_0_100%)]
`;

const MonthTitle = tw.div`
  text-center
  text-fg-neutral
  text-lg
  font-bold
  font-['Min_Sans_VF']
  leading-6
`;

const WeekHeader = tw.div`
  self-stretch
  py-2
  grid
  grid-cols-7
  gap-0
`;

const WeekDayLabel = tw.div`
  w-9
  text-center
  text-[var(--fg-muted)]
  text-base
  font-normal
  font-['Min_Sans_VF']
  leading-5
  justify-self-center
`;

const CalendarGrid = tw.div`
  self-stretch
  grid
  grid-cols-7
  gap-0
`;

interface DayButtonProps {
  $variant: 'ghost' | 'subtle' | 'solid';
  $isCurrentMonth: boolean;
  $isDisabled: boolean;
}

const DayButton = tw.button<DayButtonProps>`
  w-9
  h-9
  min-w-9
  px-2
  rounded-xl
  flex
  justify-center
  items-center
  justify-self-center
  transition-colors
  ${(props) =>
    props.$variant === 'solid'
      ? 'bg-bg-neutral-solid'
      : props.$variant === 'subtle'
        ? 'bg-bg-neutral'
        : 'bg-bg-transparent/0'}
  ${(props) => (!props.$isDisabled ? 'cursor-pointer hover:bg-bg-neutral-hover' : 'cursor-not-allowed opacity-50')}
`;

interface DayLabelProps {
  $isCurrentMonth: boolean;
}

const DayLabel = tw.div<DayLabelProps>`
  px-1
  text-fg-neutral
  text-base
  font-normal
  font-['Min_Sans_VF']
  leading-5
  ${(props) => (!props.$isCurrentMonth ? 'opacity-0' : '')}
`;

/**
 * Usage:
 *
 * <Calendar
 *   checkInDate="2025-10-15"
 *   checkOutDate="2025-10-18"
 *   onDateSelect={(checkIn, checkOut) => {
 *     console.log('Selected:', checkIn, checkOut);
 *   }}
 *   disabledDates={['2025-10-20', '2025-10-21']}
 *   minDate="2025-10-01"
 *   maxDate="2025-12-31"
 * />
 */
