/**
 * ProductCard - 캠페인 상세 상품 카드 컴포넌트
 *
 * 캠페인 상세 페이지에서 사용되는 상품 카드입니다.
 * 썸네일, 상품명, 원가, 할인율, 할인가를 표시합니다.
 *
 * Usage:
 * <ProductCard
 *   thumbnail="/image.jpg"
 *   name="고요하우스 1001호"
 *   originalPrice={29000}
 *   price={26890}
 * />
 */

import { Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { calculateDiscountRate, formatPriceExact } from '@/shared';

export interface ProductCardProps {
  /** 상품 ID */
  id: number;
  /** 판매 ID (상품 상세 페이지 이동용) */
  saleId: number;
  /** 상품 썸네일 URL */
  thumbnail: string | null;
  /** 상품명 */
  name: string;
  /** 원가 */
  originalPrice: number;
  /** 할인가 */
  price: number;
}

export function ProductCard({
  saleId,
  thumbnail,
  name,
  originalPrice,
  price,
}: ProductCardProps) {
  const discountRate = calculateDiscountRate(originalPrice, price);
  const hasDiscount = discountRate > 0;

  return (
    <Link to="/sale/$saleId" params={{ saleId: String(saleId) }}>
      <CardContainer>
        <ThumbnailWrapper>
          <Thumbnail
            src={thumbnail || '/default-product.png'}
            alt={name}
            loading="lazy"
          />
        </ThumbnailWrapper>
        <InfoWrapper>
          <ProductName>{name}</ProductName>
          <PriceWrapper>
            {hasDiscount && (
              <OriginalPrice>{formatPriceExact(originalPrice)}</OriginalPrice>
            )}
            <DiscountRow>
              {hasDiscount && <DiscountRate>{discountRate}%</DiscountRate>}
              <Price>{formatPriceExact(price)}</Price>
            </DiscountRow>
          </PriceWrapper>
        </InfoWrapper>
      </CardContainer>
    </Link>
  );
}

// Styled Components
const CardContainer = tw.div`
  flex
  flex-col
  gap-2
  cursor-pointer
`;

const ThumbnailWrapper = tw.div`
  relative
  aspect-square
  w-full
  rounded-xl
  overflow-hidden
  border
  border-[rgba(0,0,0,0.05)]
  bg-bg-neutral-subtle
`;

const Thumbnail = tw.img`
  w-full
  h-full
  object-cover
`;

const InfoWrapper = tw.div`
  flex
  flex-col
  gap-1
`;

const ProductName = tw.p`
  text-[15px]
  leading-5
  text-fg-neutral
`;

const PriceWrapper = tw.div`
  flex
  flex-col
`;

const OriginalPrice = tw.p`
  text-xs
  leading-4
  text-fg-disabled
  line-through
`;

const DiscountRow = tw.div`
  flex
  items-center
  gap-1
`;

const DiscountRate = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-critical
`;

const Price = tw.span`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;
