/**
 * Calendar - 날짜 선택 컴포넌트
 *
 * 체크인/체크아웃 날짜를 선택할 수 있는 달력 컴포넌트입니다.
 * 날짜 범위 선택을 지원하며, 월 단위로 이동할 수 있습니다.
 */

import { useState, useMemo } from 'react';
import dayjs, {ConfigType, Dayjs} from 'dayjs';
import tw from 'tailwind-styled-components';

export interface CalendarProps {
  /** 기본 체크인 날짜 (YYYY-MM-DD) */
  defaultCheckInDate?: ConfigType;
  /** 기본 체크아웃 날짜 (YYYY-MM-DD) */
  defaultCheckOutDate?: ConfigType;
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
  defaultCheckInDate,
  defaultCheckOutDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [checkInDate, setCheckInDate] = useState<string | null>(
    defaultCheckInDate ? dayjs(defaultCheckInDate).format('YYYY-MM-DD') : null
  );
  const [checkOutDate, setCheckOutDate] = useState<string | null>(
    defaultCheckOutDate ? dayjs(defaultCheckOutDate).format('YYYY-MM-DD') : null
  );
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const handleDateClick = (date: string) => {
    // 선택 불가능한 날짜 체크
    if (disabledDates.includes(date)) return;
    if (minDate && dayjs(date).isBefore(dayjs(minDate))) return;
    if (maxDate && dayjs(date).isAfter(dayjs(maxDate))) return;

    // 체크인 날짜가 없으면 체크인 설정
    if (!checkInDate) {
      setCheckInDate(date);
      setCheckOutDate(null);
      onDateSelect?.(date, null);
      return;
    }

    // 체크인 날짜만 있으면 체크아웃 설정
    if (!checkOutDate) {
      if (dayjs(date).isBefore(dayjs(checkInDate))) {
        // 체크인보다 이전 날짜를 선택하면 체크인을 다시 설정
        setCheckInDate(date);
        setCheckOutDate(null);
        onDateSelect?.(date, null);
      } else {
        setCheckOutDate(date);
        onDateSelect?.(checkInDate, date);
      }
      return;
    }

    // 둘 다 있으면 초기화하고 새로 시작
    setCheckInDate(date);
    setCheckOutDate(null);
    onDateSelect?.(date, null);
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
            {"<"}
          </Icon>
        </IconButton>
        <MonthTitle>{currentMonth.format('YYYY.MM')}</MonthTitle>
        <IconButton onClick={handleNextMonth} type="button">
          <Icon>
            {">"}
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
          const isSelected = checkInDate === dateStr || checkOutDate === dateStr;
          const isInRange = 
            checkInDate && 
            checkOutDate && 
            !dayDate.isBefore(dayjs(checkInDate)) && 
            !dayDate.isAfter(dayjs(checkOutDate));
          
          const isRangeStart = checkInDate === dateStr;
          const isRangeEnd = checkOutDate === dateStr;
          const isSunday = dayDate.day() === 0;
          const isSaturday = dayDate.day() === 6;
          const isFirstDayOfMonth = dayDate.date() === 1;
          const isLastDayOfMonth = dayDate.date() === dayDate.daysInMonth();

          return (
            <DayBack 
              key={dateStr}
              $rangeLeft={isCurrentMonth && isInRange && !isRangeStart && !isSunday && !isFirstDayOfMonth}
              $rangeRight={isCurrentMonth && isInRange && !isRangeEnd && !isSaturday && !isLastDayOfMonth}
              $isCurrentMonth={isCurrentMonth}
            >
              <DayButton
                onClick={() => !isDisabled && isCurrentMonth && handleDateClick(dateStr)}
                $isSelected={isSelected}
                $isCurrentMonth={isCurrentMonth}
                $isDisabled={isDisabled}
                $isInRange={isInRange}
                type="button"
              >
                <DayLabel $isSelected={isSelected} $isCurrentMonth={isCurrentMonth}>
                  {dayDate.date()}
                </DayLabel>
              </DayButton>
            </DayBack>
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
  leading-5
  justify-self-center
`;

const CalendarGrid = tw.div`
  self-stretch
  grid
  grid-cols-7
  gap-x-0
  gap-y-1
`;

interface DayBackProps {
  $rangeLeft: boolean;
  $rangeRight: boolean;
  $isCurrentMonth: boolean;
}

const DayBack = tw.div<DayBackProps>`
  relative
  ${(props) => !props.$isCurrentMonth ? 'opacity-0' : ''}
  ${(props) => {
    const bgClasses = [];
    
    // 일요일에는 right만, 토요일에는 left만 적용
    if (props.$rangeLeft) {
      bgClasses.push('before:absolute before:content-[""] before:left-0 before:top-0 before:w-1/2 before:h-full before:bg-[var(--bg-layer-base)]');
    }
    
    if (props.$rangeRight) {
      bgClasses.push('after:absolute after:content-[""] after:right-0 after:top-0 after:w-1/2 after:h-full after:bg-[var(--bg-layer-base)]');
    }
    
    return bgClasses.join(' ');
  }}
`;

interface DayButtonProps {
  $isSelected: boolean;
  $isCurrentMonth: boolean;
  $isDisabled: boolean;
  $isInRange: boolean;
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
  relative
  z-[1]
  ${(props) => (props.$isSelected ? 'bg-[var(--bg-neutral-solid)]' : props.$isInRange ? 'bg-[var(--bg-layer-base)]' : 'bg-transparent')}
  ${(props) => (!props.$isDisabled && !props.$isSelected ? 'cursor-pointer hover:bg-[var(--bg-neutral-hover)]' : '')}
  ${(props) => (props.$isDisabled ? 'cursor-not-allowed opacity-50' : '')}
`;

interface DayLabelProps {
  $isSelected: boolean;
  $isCurrentMonth: boolean;
}

const DayLabel = tw.div<DayLabelProps>`
  px-1
  text-base
  font-normal
  leading-5
  ${(props) => (props.$isSelected ? 'text-[var(--fg-on-surface)]' : 'text-[var(--fg-neutral)]')}
  ${(props) => (!props.$isCurrentMonth ? 'opacity-0' : '')}
`;

/**
 * Usage:
 *
 * <Calendar
 *   defaultCheckInDate="2025-10-15"
 *   defaultCheckOutDate="2025-10-18"
 *   onDateSelect={(checkIn, checkOut) => {
 *     console.log('Selected:', checkIn, checkOut);
 *   }}
 *   disabledDates={['2025-10-20', '2025-10-21']}
 *   minDate="2025-10-01"
 *   maxDate="2025-12-31"
 * />
 */
