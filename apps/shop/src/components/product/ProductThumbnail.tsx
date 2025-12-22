/**
 * ProductThumbnail - 상품 썸네일 이미지
 *
 * 상품의 메인 이미지를 표시합니다.
 * 이미지는 1:1 비율로 표시됩니다.
 */

import tw from 'tailwind-styled-components';

export interface ProductThumbnailProps {
  /** 썸네일 이미지 URL */
  imageUrl: string;
  /** 이미지 대체 텍스트 */
  alt?: string;
}

export function ProductThumbnail({
  imageUrl,
  alt = '상품 이미지',
}: ProductThumbnailProps) {
  return (
    <Container>
      <Image src={imageUrl} alt={alt} />
    </Container>
  );
}

const Container = tw.div`
  w-full
  aspect-square
  relative
  overflow-hidden
`;

const Image = tw.img`
  w-full
  h-full
  object-cover
`;

/**
 * Usage:
 *
 * <ProductThumbnail
 *   imageUrl="https://example.com/product.jpg"
 *   alt="호텔 객실 이미지"
 * />
 */
