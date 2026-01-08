/**
 * CampaignInfo - 캠페인 정보 영역 컴포넌트
 *
 * 캠페인 상태 뱃지, 제목, 기간을 중앙 정렬로 표시합니다.
 *
 * Usage:
 * <CampaignInfo
 *   title="이번 크리스마스는 고요하우스"
 *   startAt={new Date()}
 *   endAt={new Date()}
 * />
 */

import { Clock } from 'lucide-react';
import tw from 'tailwind-styled-components';

import {
  type CampaignStatusType,
  formatShortDate,
  getCampaignStatus,
} from '@/shared';

export interface CampaignInfoProps {
  /** 캠페인 제목 */
  title: string;
  /** 캠페인 시작일 */
  startAt: Date | string;
  /** 캠페인 종료일 */
  endAt: Date | string;
}

export function CampaignInfo({ title, startAt, endAt }: CampaignInfoProps) {
  const status = getCampaignStatus(startAt, endAt);

  return (
    <Container>
      <StatusBadge $type={status.type}>
        <Clock size={16} />
        <BadgeText>{status.label}</BadgeText>
      </StatusBadge>
      <TitleWrapper>
        <Title>{title}</Title>
        <Period>
          {formatShortDate(startAt)} ~ {formatShortDate(endAt)}
        </Period>
      </TitleWrapper>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  flex
  flex-col
  items-center
  gap-3
  px-5
  py-8
`;

const StatusBadge = tw.div<{ $type: CampaignStatusType }>`
  h-5
  px-1
  rounded-lg
  inline-flex
  items-center
  gap-0.5
  text-fg-neutral-inverted
  ${({ $type }) =>
    $type === 'upcoming' ? 'bg-bg-neutral-solid' : 'bg-bg-primary-solid'}
`;

const BadgeText = tw.span`
  text-xs
  font-medium
  leading-4
  px-0.5
`;

const TitleWrapper = tw.div`
  flex
  flex-col
  items-center
  gap-1
`;

const Title = tw.h1`
  text-[21px]
  font-bold
  leading-7
  text-fg-neutral
  text-center
`;

const Period = tw.p`
  text-[13.5px]
  leading-[18px]
  text-fg-neutral
`;
