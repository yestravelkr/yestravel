/**
 * DescriptionList - 라벨-값 쌍 표시 컴포넌트
 *
 * 결제정보, 회원정보 등에서 라벨과 값을 나란히 표시할 때 사용
 */

import tw from 'tailwind-styled-components';

export interface DescriptionItem {
  /** 라벨 */
  label: string;
  /** 값 */
  value: React.ReactNode;
  /** 값 강조 여부 */
  highlight?: boolean;
}

interface DescriptionListProps {
  /** 항목 목록 */
  items: DescriptionItem[];
  /** 값 정렬 (기본: left) */
  valueAlign?: 'left' | 'right';
}

/**
 * Usage:
 * ```tsx
 * <DescriptionList
 *   items={[
 *     { label: '결제수단', value: '카드' },
 *     { label: '상품금액', value: '20,000원' },
 *     { label: '총 주문금액', value: '6,000원', highlight: true },
 *   ]}
 *   valueAlign="right"
 * />
 * ```
 */
export function DescriptionList({
  items,
  valueAlign = 'left',
}: DescriptionListProps) {
  return (
    <Container>
      {items.map((item, index) => (
        <Row key={index}>
          <Label $highlight={item.highlight}>{item.label}</Label>
          <Value $align={valueAlign} $highlight={item.highlight}>
            {item.value}
          </Value>
        </Row>
      ))}
    </Container>
  );
}

const Container = tw.div`
  flex
  flex-col
  gap-2
`;

const Row = tw.div`
  flex
  gap-2
  items-center
`;

const Label = tw.span<{ $highlight?: boolean }>`
  w-[100px]
  shrink-0
  text-base
  leading-[22px]
  ${(p) =>
    p.$highlight
      ? 'text-[var(--fg-neutral)] font-normal'
      : 'text-[var(--fg-neutral)]'}
`;

const Value = tw.span<{ $align: 'left' | 'right'; $highlight?: boolean }>`
  flex-1
  min-w-0
  text-base
  leading-[22px]
  ${(p) => (p.$align === 'right' ? 'text-right' : 'text-left')}
  ${(p) =>
    p.$highlight
      ? 'text-[var(--fg-neutral)] font-bold text-[21px] leading-7'
      : 'text-[var(--fg-neutral)]'}
`;
