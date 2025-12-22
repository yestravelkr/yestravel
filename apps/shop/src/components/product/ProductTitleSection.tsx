/**
 * ProductTitleSection - 상품 타이틀 섹션
 *
 * 상품의 뱃지, 이름, 정가, 할인가를 표시합니다.
 */

import { Clock } from 'lucide-react';
import tw from 'tailwind-styled-components';

export interface ProductTitleSectionProps {
  /** 상품명 */
  name: string;
  /** 정가 (원) */
  originalPrice: number;
  /** 할인가 (원) - 할인이 없으면 정가와 동일하게 설정 */
  discountedPrice: number;
  /** 뱃지 텍스트 (예: "3일 후 종료") */
  badgeText?: string;
}

export function ProductTitleSection({
  name,
  originalPrice,
  discountedPrice,
  badgeText,
}: ProductTitleSectionProps) {
  const hasDiscount = originalPrice > discountedPrice;
  const discountRate = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <Container>
      {badgeText && (
        <Badge>
          <Clock size={14} />
          <BadgeText>{badgeText}</BadgeText>
        </Badge>
      )}
      <ProductName>{name}</ProductName>
      <PriceContainer>
        {hasDiscount && (
          <OriginalPrice>{originalPrice.toLocaleString()}원</OriginalPrice>
        )}
        <DiscountedPriceRow>
          {hasDiscount && <DiscountRate>{discountRate}%</DiscountRate>}
          <FinalPrice>{discountedPrice.toLocaleString()}원</FinalPrice>
        </DiscountedPriceRow>
      </PriceContainer>
    </Container>
  );
}

const Container = tw.div`
  w-full
  p-5
  bg-bg-layer
  flex
  flex-col
  gap-3
`;

const Badge = tw.div`
  h-5
  px-1.5
  bg-bg-primary-solid
  rounded-lg
  inline-flex
  items-center
  gap-1
  w-fit
  text-fg-neutral-inverted
`;

const BadgeText = tw.span`
  text-xs
  font-medium
  leading-4
`;

const ProductName = tw.h1`
  text-base
  font-normal
  text-fg-neutral
  leading-5
`;

const PriceContainer = tw.div`
  flex
  flex-col
`;

const OriginalPrice = tw.span`
  text-sm
  font-normal
  text-fg-disabled
  line-through
  leading-4
`;

const DiscountedPriceRow = tw.div`
  flex
  items-start
  gap-2
`;

const DiscountRate = tw.span`
  text-xl
  font-bold
  text-fg-critical
  leading-7
`;

const FinalPrice = tw.span`
  text-xl
  font-bold
  text-fg-neutral
  leading-7
`;

/**
 * Usage:
 *
 * <ProductTitleSection
 *   name="[폭닥,울니트] 니트 필수템, 도톰 데일리 나그랑 꽈배기 라운드 아방 루즈핏 울 긴팔니트 (7color)"
 *   originalPrice={29000}
 *   discountedPrice={26890}
 *   badgeText="3일 후 종료"
 * />
 */
