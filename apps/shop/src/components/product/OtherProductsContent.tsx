/**
 * OtherProductsContent - 같은 캠페인의 다른 상품 목록
 *
 * 현재 보고 있는 상품을 제외한 동일 캠페인의 다른 상품들을 표시합니다.
 * shopInfluencer.getCampaignDetail API를 호출하여 캠페인 내 상품 목록을 가져옵니다.
 *
 * Usage:
 * <OtherProductsContent
 *   slug="influencer-slug"
 *   campaignId={1}
 *   currentSaleId={123}
 * />
 */

import tw from 'tailwind-styled-components';

import { ProductCard } from '@/components/campaign/ProductCard';
import { trpc } from '@/shared';

export interface OtherProductsContentProps {
  /** 인플루언서 slug */
  slug: string;
  /** 캠페인 ID */
  campaignId: number;
  /** 현재 보고 있는 상품의 saleId (필터링용) */
  currentSaleId: number;
}

/**
 * OtherProductsContent - 다른 상품 목록
 */
export function OtherProductsContent({
  slug,
  campaignId,
  currentSaleId,
}: OtherProductsContentProps) {
  const { data, isLoading, isError } =
    trpc.shopInfluencer.getCampaignDetail.useQuery(
      { slug, campaignId },
      { retry: false, staleTime: 1000 * 60 * 5 }
    );

  if (isLoading) {
    return <StatusContainer>불러오는 중...</StatusContainer>;
  }

  if (isError || !data) {
    return <StatusContainer>다른 상품이 없습니다.</StatusContainer>;
  }

  const otherProducts = data.products.filter(
    product => product.saleId !== currentSaleId
  );

  if (otherProducts.length === 0) {
    return <StatusContainer>다른 상품이 없습니다.</StatusContainer>;
  }

  return (
    <GridContainer>
      {otherProducts.map(product => (
        <ProductCard
          key={product.id}
          id={product.id}
          saleId={product.saleId}
          thumbnail={product.thumbnail}
          name={product.name}
          originalPrice={product.originalPrice}
          price={product.price}
        />
      ))}
    </GridContainer>
  );
}

// Styled Components
const StatusContainer = tw.div`
  p-10
  text-center
  text-fg-muted
  bg-white
`;

const GridContainer = tw.div`
  grid
  grid-cols-2
  gap-4
  p-5
  bg-white
`;
