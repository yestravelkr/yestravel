import { Calendar } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { InfoRowSection } from './InfoRowSection';

/**
 * CheckInOutSection - 호텔 체크인/체크아웃 날짜 표시
 */
export interface CheckInOutSectionProps {
  /** 체크인 텍스트 (예: "체크인 03.20(금)") */
  checkInDate: string;
  /** 체크아웃 텍스트 (예: "체크아웃 03.21(토)") */
  checkOutDate: string;
}

/**
 * Usage:
 * <CheckInOutSection checkInDate="체크인 03.20(금)" checkOutDate="체크아웃 03.21(토)" />
 */
export function CheckInOutSection({
  checkInDate,
  checkOutDate,
}: CheckInOutSectionProps) {
  return (
    <InfoRowSection icon={<Calendar size={18} />}>
      <DateText>
        {checkInDate} · {checkOutDate}
      </DateText>
    </InfoRowSection>
  );
}

const DateText = tw.span`
  text-base font-normal text-fg-neutral leading-5
`;
