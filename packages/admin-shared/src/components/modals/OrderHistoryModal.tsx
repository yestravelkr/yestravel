/**
 * OrderHistoryModal - 주문 히스토리 모달
 *
 * 주문의 상태 변경 이력을 시간순으로 표시합니다.
 * 옵션별 필터 칩으로 특정 옵션의 이력만 조회할 수 있습니다.
 *
 * Usage:
 * const result = await openOrderHistoryModal({
 *   histories: [...],
 *   options: [{ id: 1, name: '디럭스룸' }],
 * });
 */

import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

export interface OrderHistoryItemData {
  /** 히스토리 ID */
  id: number;
  /** 설명 (UI 표시용) */
  description: string | null;
  /** 옵션 ID (null이면 주문 전체 관련) */
  optionId: number | null;
  /** 옵션 이름 */
  optionName: string | null;
  /** 생성 일시 */
  createdAt: Date | string;
}

interface OrderHistoryModalProps {
  /** 히스토리 목록 */
  histories: OrderHistoryItemData[];
  /** 주문에 포함된 옵션 목록 */
  options: { id: number; name: string }[];
}

export function OrderHistoryModal({
  histories,
  options,
}: OrderHistoryModalProps) {
  const { resolveModal } = useCurrentModal();
  const [selectedFilter, setSelectedFilter] = useState<'all' | number>('all');

  const optionsMap = useMemo(
    () => new Map(options.map((o) => [o.id, o.name])),
    [options],
  );

  // 히스토리에서 실제 사용된 고유 옵션 ID 목록
  const uniqueOptionIds = useMemo(() => {
    const ids = new Set<number>();
    histories.forEach((h) => {
      if (h.optionId != null) ids.add(h.optionId);
    });
    return Array.from(ids);
  }, [histories]);

  // 필터링된 히스토리
  const filteredHistories = useMemo(() => {
    if (selectedFilter === 'all') return histories;
    return histories.filter(
      (h) => h.optionId === null || h.optionId === selectedFilter,
    );
  }, [histories, selectedFilter]);

  const handleConfirm = () => {
    resolveModal(null);
  };

  return (
    <Container>
      <Title>주문 히스토리</Title>

      {/* 필터 칩 - 옵션이 있을 때만 표시 */}
      {uniqueOptionIds.length > 0 && (
        <FilterChips>
          <Chip
            $selected={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
          >
            전체
          </Chip>
          {uniqueOptionIds.map((optionId) => (
            <Chip
              key={optionId}
              $selected={selectedFilter === optionId}
              onClick={() => setSelectedFilter(optionId)}
            >
              {optionsMap.get(optionId) ?? '알 수 없는 옵션'}
            </Chip>
          ))}
        </FilterChips>
      )}

      {/* 히스토리 목록 */}
      {filteredHistories.length > 0 ? (
        <HistoryList>
          {filteredHistories.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Divider />}
              <HistoryItem>
                <Description>{item.description ?? '상태 변경'}</Description>
                <DateInfo>
                  {dayjs(item.createdAt).format('YY.MM.DD HH:mm')}
                  {item.optionName && <> &middot; {item.optionName}</>}
                </DateInfo>
              </HistoryItem>
            </div>
          ))}
        </HistoryList>
      ) : (
        <EmptyState>주문 히스토리가 없습니다.</EmptyState>
      )}

      {/* 확인 버튼 */}
      <Button
        kind="neutral"
        variant="solid"
        size="large"
        onClick={handleConfirm}
      >
        확인
      </Button>
    </Container>
  );
}

/**
 * 주문 히스토리 모달을 열고 결과를 반환합니다.
 */
export function openOrderHistoryModal(
  props: OrderHistoryModalProps,
): Promise<null> {
  return SnappyModal.show(<OrderHistoryModal {...props} />, {
    position: 'center',
  });
}

// ========================================
// Styled Components
// ========================================

const Container = tw.div`
  w-[480px]
  max-h-[80vh]
  p-5
  bg-white
  rounded-[20px]
  flex flex-col gap-4
`;

const Title = tw.h2`
  text-[21px] font-bold
  text-[var(--fg-neutral)]
  leading-7
`;

const FilterChips = tw.div`
  flex gap-2 flex-wrap
`;

const Chip = tw.button<{ $selected: boolean }>`
  px-3 py-1.5
  rounded-full
  text-[13px] font-medium
  transition-colors
  ${({ $selected }) =>
    $selected
      ? 'bg-gray-900 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
`;

const HistoryList = tw.div`
  bg-[var(--bg-neutral)]
  rounded-xl
  overflow-y-auto
  max-h-[50vh]
`;

const HistoryItem = tw.div`
  px-4 py-3
`;

const Description = tw.p`
  text-[15px] font-medium
  text-[var(--fg-neutral)]
  leading-5
`;

const DateInfo = tw.p`
  text-[13px]
  text-[var(--fg-muted)]
  mt-0.5
  leading-4
`;

const Divider = tw.div`
  h-px
  bg-[var(--stroke-neutral)]
  mx-4
`;

const EmptyState = tw.div`
  bg-[var(--bg-neutral)]
  rounded-xl
  px-4 py-8
  text-center
  text-[15px]
  text-[var(--fg-muted)]
`;
