/**
 * ListPageLayout - 리스트 페이지 레이아웃 컴포넌트
 *
 * 탭, 필터, 테이블, 페이지네이션을 포함하는 리스트 페이지 공통 레이아웃
 * 모든 요소가 하나의 흰색 박스 안에 포함됨
 */

import tw from 'tailwind-styled-components';

interface ListPageLayoutProps {
  /** 탭 영역 */
  tabs?: React.ReactNode;
  /** 필터 영역 */
  filters?: React.ReactNode;
  /** 테이블 툴바 (주문 n개씩 보기) */
  toolbar?: React.ReactNode;
  /** 테이블 */
  table: React.ReactNode;
  /** 페이지네이션 */
  pagination?: React.ReactNode;
}

/**
 * Usage:
 * ```tsx
 * <ListPageLayout
 *   tabs={<StatusTabs ... />}
 *   filters={<OrderFilters ... />}
 *   toolbar={<TableToolbar ... />}
 *   table={<Table ... />}
 *   pagination={<Pagination ... />}
 * />
 * ```
 */
export function ListPageLayout({
  tabs,
  filters,
  toolbar,
  table,
  pagination,
}: ListPageLayoutProps) {
  return (
    <Container>
      {tabs}
      {filters}
      {toolbar}
      {table}
      {pagination}
    </Container>
  );
}

const Container = tw.div`
  flex
  flex-col
  items-stretch
  gap-5
  p-5
  rounded-[20px]
  bg-[var(--bg-layer,#FFF)]
`;
