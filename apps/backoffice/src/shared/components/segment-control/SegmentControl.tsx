/**
 * SegmentControl - 세그먼트 컨트롤 (탭 토글) 컴포넌트
 *
 * 여러 옵션 중 하나를 선택하는 토글 UI입니다.
 * 제네릭 타입을 지원하여 다양한 value 타입에 사용 가능합니다.
 *
 * Usage:
 * <SegmentControl
 *   items={[
 *     { value: 'campaign', label: '캠페인보기' },
 *     { value: 'product', label: '상품별보기' },
 *   ]}
 *   value="campaign"
 *   onChange={(value) => console.log(value)}
 * />
 */

import tw from 'tailwind-styled-components';

export interface SegmentControlItem<T> {
  /** 아이템 값 */
  value: T;
  /** 아이템 라벨 */
  label: string;
}

export interface SegmentControlProps<T> {
  /** 탭 목록 */
  items: SegmentControlItem<T>[];
  /** 현재 선택된 값 */
  value: T;
  /** 변경 콜백 */
  onChange: (value: T) => void;
  /** 사이즈 (기본: medium) */
  size?: 'medium' | 'large';
}

/**
 * Usage:
 * <SegmentControl
 *   items={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
 *   value="a"
 *   onChange={(v) => setValue(v)}
 *   size="medium"
 * />
 */
export function SegmentControl<T extends string | number>({
  items,
  value,
  onChange,
  size = 'medium',
}: SegmentControlProps<T>) {
  return (
    <Container>
      {items.map((item) => {
        const isSelected = item.value === value;
        return (
          <Item
            key={String(item.value)}
            $selected={isSelected}
            $size={size}
            onClick={() => onChange(item.value)}
            type="button"
          >
            {item.label}
          </Item>
        );
      })}
    </Container>
  );
}

/** Styled Components */

const Container = tw.div`
  flex
  items-center
  bg-[#f4f4f5]
  rounded-xl
  p-1
`;

const Item = tw.button<{ $selected: boolean; $size: 'medium' | 'large' }>`
  rounded-xl
  px-3
  font-medium
  text-[15px]
  leading-5
  cursor-pointer
  transition-colors
  whitespace-nowrap
  ${(p) => (p.$size === 'large' ? 'h-11' : 'h-9')}
  ${(p) =>
    p.$selected
      ? 'bg-white border border-[#e4e4e7] text-[#18181b]'
      : 'bg-transparent border border-transparent text-[#71717a] hover:text-[#18181b]'}
`;
