/**
 * HotelProductComponent - 호텔 상품 표시 컴포넌트
 *
 * 호텔 타입 상품을 표시하는 컴포넌트입니다.
 * 체크인/체크아웃 날짜 선택, 호텔 옵션 선택, 가격 계산 등을 처리합니다.
 */

import tw from 'tailwind-styled-components';

export function HotelProductComponent() {
  return (
    <Container>
      <ProductTitle>호텔 상품</ProductTitle>

      {/* TODO: 호텔 상품 상세 정보 표시 */}
      {/* TODO: 체크인/체크아웃 날짜 선택 */}
      {/* TODO: 호텔 옵션 선택 */}
      {/* TODO: 가격 계산 및 표시 */}
      {/* TODO: 예약하기 버튼 */}
    </Container>
  );
}

/**
 * Usage:
 *
 * <HotelProductComponent />
 */

// Styled Components
const Container = tw.div`
  flex
  flex-col
  gap-4
  p-5
`;

const ProductTitle = tw.h1`
  text-2xl
  font-bold
  text-fg-neutral
`;
