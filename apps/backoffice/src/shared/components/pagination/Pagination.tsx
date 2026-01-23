/**
 * Pagination - 페이지네이션 공통 컴포넌트
 *
 * 테이블 하단에 사용하는 페이지 네비게이션
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface PaginationProps {
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 표시할 페이지 버튼 수 (기본 5) */
  maxVisiblePages?: number;
}

/**
 * Usage:
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  type PageItem = number | 'ellipsis';

  const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getPageItems = (): PageItem[] => {
    if (totalPages <= 7) {
      return range(1, totalPages);
    }

    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    const middlePages =
      currentPage <= 4
        ? range(2, 5)
        : currentPage >= totalPages - 3
          ? range(totalPages - 4, totalPages - 1)
          : range(currentPage - 1, currentPage + 1);

    return [
      1,
      ...(showLeftEllipsis ? (['ellipsis'] as const) : []),
      ...middlePages,
      ...(showRightEllipsis ? (['ellipsis'] as const) : []),
      totalPages,
    ].filter(
      (item, index, arr) => item === 'ellipsis' || arr.indexOf(item) === index,
    ) as PageItem[];
  };

  const pageItems = getPageItems();

  return (
    <Container>
      <NavButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </NavButton>

      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
        ) : (
          <PageButton
            key={item}
            $active={item === currentPage}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PageButton>
        ),
      )}

      <NavButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </NavButton>
    </Container>
  );
}

const Container = tw.div`
  flex
  items-center
  justify-center
  gap-1
`;

const NavButton = tw.button`
  flex
  items-center
  justify-center
  w-8
  h-8
  rounded-lg
  text-gray-500
  hover:bg-gray-100
  disabled:opacity-40
  disabled:cursor-not-allowed
  disabled:hover:bg-transparent
  transition-all
  duration-200
  ease-out
`;

const PageButton = tw.button<{ $active: boolean }>`
  flex
  items-center
  justify-center
  w-8
  h-8
  rounded-lg
  text-sm
  font-medium
  transition-all
  duration-200
  ease-out
  ${(props) =>
    props.$active
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:bg-gray-100'}
`;

const Ellipsis = tw.span`
  flex
  items-center
  justify-center
  w-8
  h-8
  text-sm
  text-gray-400
`;
