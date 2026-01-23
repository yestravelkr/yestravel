/**
 * TableToolbar - 테이블 상단 툴바 공통 컴포넌트
 *
 * 테이블 위에 총 개수 표시 + 페이지 사이즈 선택 드롭다운
 */

import { Menu } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface TableToolbarProps {
  /** 표시할 라벨 (예: "주문") */
  label: string;
  /** 전체 개수 */
  totalCount: number;
  /** 현재 페이지 사이즈 */
  pageSize: number;
  /** 페이지 사이즈 옵션 */
  pageSizeOptions?: number[];
  /** 페이지 사이즈 변경 핸들러 */
  onPageSizeChange: (size: number) => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 30, 50, 100];

/**
 * Usage:
 * ```tsx
 * <TableToolbar
 *   label="주문"
 *   totalCount={30}
 *   pageSize={50}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 * ```
 */
export function TableToolbar({
  label,
  totalCount,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}: TableToolbarProps) {
  return (
    <Container>
      <LabelSection>
        <MenuIcon size={16} />
        {label} {totalCount}
      </LabelSection>

      <PageSizeSelect
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}개씩 보기
          </option>
        ))}
      </PageSizeSelect>
    </Container>
  );
}

const Container = tw.div`
  flex
  items-center
  justify-between
  py-2
`;

const LabelSection = tw.div`
  flex
  items-center
  gap-2
  text-sm
  font-medium
  text-gray-700
`;

const MenuIcon = tw(Menu)`
  text-gray-500
`;

const PageSizeSelect = tw.select`
  px-3
  py-1.5
  text-sm
  border
  border-gray-200
  rounded-lg
  bg-white
  text-gray-700
  cursor-pointer
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  transition-all
  duration-200
`;
