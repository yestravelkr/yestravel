/**
 * ProductGrid - 캠페인 상품 그리드 컴포넌트
 *
 * 캠페인 상세 페이지에서 상품 목록을 그리드로 표시합니다.
 * 모바일 1열, sm 이상에서 2열 그리드로 반응형 처리됩니다.
 *
 * Usage:
 * <ProductGrid products={products} />
 */

import tw from 'tailwind-styled-components';

import { ProductCard, type ProductCardProps } from './ProductCard';

export interface ProductGridProps {
  /** 상품 목록 */
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState>
        <EmptyText>등록된 상품이 없습니다.</EmptyText>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </GridContainer>
  );
}

// Styled Components
const GridContainer = tw.div`
  grid
  grid-cols-1
  sm:grid-cols-2
  gap-x-3
  gap-y-5
  px-5
`;

const EmptyState = tw.div`
  flex
  justify-center
  items-center
  py-16
  px-5
`;

const EmptyText = tw.p`
  text-fg-muted
  text-lg
`;
