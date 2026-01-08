/**
 * CancelledProductsSection - 취소 요청 상품 섹션
 *
 * 취소 요청된 상품 목록을 표시하는 컴포넌트입니다.
 *
 * Usage:
 * <CancelledProductsSection
 *   products={cancelledProducts}
 *   onWithdraw={() => console.log('취소 철회')}
 * />
 */

import { ChevronRight } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { formatPriceExact } from '@/shared';

export interface CancelledProduct {
  id: string;
  thumbnail: string | null;
  name: string;
  option: string;
  price: number;
  quantity: number;
}

export interface CancelledProductsSectionProps {
  products: CancelledProduct[] | undefined;
  onWithdraw: () => void;
}

export function CancelledProductsSection({
  products,
  onWithdraw,
}: CancelledProductsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>취소요청</SectionTitle>
        <InlineButton>
          <InlineButtonText>상세보기</InlineButtonText>
          <ChevronRight size={20} />
        </InlineButton>
      </SectionHeader>
      <ProductListContainer>
        {products.map(product => (
          <ProductItemContainer key={product.id}>
            <ProductThumbnail
              src={product.thumbnail || '/default-product.png'}
              alt={product.name}
              loading="lazy"
            />
            <ProductDetails>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                {product.option && (
                  <ProductOption>{product.option}</ProductOption>
                )}
              </ProductInfo>
              <ProductPriceRow>
                <ProductPrice>{formatPriceExact(product.price)}</ProductPrice>
                <ProductQuantity>{product.quantity}개</ProductQuantity>
              </ProductPriceRow>
            </ProductDetails>
          </ProductItemContainer>
        ))}
      </ProductListContainer>
      <ActionContainer>
        <SubtleButtonStyled onClick={onWithdraw}>취소 철회</SubtleButtonStyled>
      </ActionContainer>
    </Section>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const Section = tw.section`
  bg-white
  p-5
  flex
  flex-col
  gap-5
`;

const SectionHeader = tw.div`
  flex
  items-center
  justify-between
`;

const SectionTitle = tw.h3`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const InlineButton = tw.button`
  flex
  items-center
  gap-1
  text-fg-neutral
`;

const InlineButtonText = tw.span`
  text-[15px]
  leading-5
`;

const ProductListContainer = tw.div`
  flex
  flex-col
  gap-4
`;

const ProductItemContainer = tw.div`
  flex
  gap-3
  items-start
`;

const ProductThumbnail = tw.img`
  w-[52px]
  h-[52px]
  rounded-xl
  object-cover
  border
  border-[rgba(0,0,0,0.05)]
  flex-shrink-0
`;

const ProductDetails = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const ProductInfo = tw.div`
  flex
  flex-col
`;

const ProductName = tw.p`
  text-[15px]
  leading-5
  text-fg-neutral
`;

const ProductOption = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const ProductPriceRow = tw.div`
  flex
  items-baseline
  gap-1
`;

const ProductPrice = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const ProductQuantity = tw.span`
  text-[15px]
  leading-5
  text-fg-muted
`;

const ActionContainer = tw.div`
  flex
  gap-2
`;

const SubtleButtonStyled = tw.button`
  flex-1
  h-11
  bg-bg-neutral
  text-fg-neutral
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:opacity-90
  transition-opacity
`;
