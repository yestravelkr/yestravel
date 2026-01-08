/**
 * FloatingDateButton - 플로팅 날짜 선택 버튼 컴포넌트
 *
 * 캠페인 상세 페이지 하단에 고정되는 날짜 표시 버튼입니다.
 *
 * Usage:
 * <FloatingDateButton
 *   startAt={new Date()}
 *   endAt={new Date()}
 *   onClick={() => {}}
 * />
 */

import { Calendar } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { formatDateWithDay } from '@/shared';

export interface FloatingDateButtonProps {
  /** 캠페인 시작일 */
  startAt: Date | string;
  /** 캠페인 종료일 */
  endAt: Date | string;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

export function FloatingDateButton({
  startAt,
  endAt,
  onClick,
}: FloatingDateButtonProps) {
  return (
    <Container>
      <Button onClick={onClick}>
        <Calendar size={22} />
        <DateText>
          {formatDateWithDay(startAt)} ~ {formatDateWithDay(endAt)}
        </DateText>
      </Button>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  fixed
  bottom-8
  left-1/2
  -translate-x-1/2
  z-50
`;

const Button = tw.button`
  h-11
  px-3
  rounded-full
  bg-white
  border
  border-stroke-neutral
  shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.12)]
  flex
  items-center
  gap-1
  text-fg-neutral
  hover:bg-gray-50
  transition-colors
`;

const DateText = tw.span`
  text-[16.5px]
  font-medium
  leading-[22px]
  px-1
  whitespace-nowrap
`;
