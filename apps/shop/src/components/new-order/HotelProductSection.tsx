/**
 * HotelProductSection - 호텔 상품 정보 섹션
 *
 * 호텔 상품명, 옵션, 체크인/체크아웃 정보를 표시합니다.
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import tw from 'tailwind-styled-components';

dayjs.locale('ko');

export interface HotelProductSectionProps {
  thumbnailUrl: string | null;
  productName: string;
  optionName: string;
  /** 서브 옵션명 (패키지 정보 등) */
  subOptionName?: string;
  /** 체크인 날짜 (Date 또는 ISO string) */
  checkInDate: Date | string;
  checkInTime: string;
  /** 체크아웃 날짜 (Date 또는 ISO string) */
  checkOutDate: Date | string;
  checkOutTime: string;
}

export function HotelProductSection({
  thumbnailUrl,
  productName,
  optionName,
  subOptionName,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
}: HotelProductSectionProps) {
  return (
    <Section>
      <ProductCard>
        <ProductInfo>
          <Thumbnail
            src={thumbnailUrl || 'https://placehold.co/48x48'}
            alt={productName}
          />
          <ProductDetails>
            <ProductName>{productName}</ProductName>
            <OptionInfo>
              <OptionName>{optionName}</OptionName>
              {subOptionName && <SubOptionName>{subOptionName}</SubOptionName>}
            </OptionInfo>
          </ProductDetails>
        </ProductInfo>
      </ProductCard>

      <Divider />

      <CheckInOutContainer>
        <CheckInOutItem>
          <CheckInOutLabel>체크인</CheckInOutLabel>
          <CheckInOutValue>
            {dayjs(checkInDate).format('YY.MM.DD(ddd)')}
            <br />
            {checkInTime
              .split(':')
              .filter((_, idx) => idx < 2)
              .join(':')}
          </CheckInOutValue>
        </CheckInOutItem>
        <CheckInOutItem>
          <CheckInOutLabel>체크아웃</CheckInOutLabel>
          <CheckInOutValue>
            {dayjs(checkOutDate).format('YY.MM.DD(ddd)')}
            <br />
            {checkOutTime
              .split(':')
              .filter((_, idx) => idx < 2)
              .join(':')}
          </CheckInOutValue>
        </CheckInOutItem>
      </CheckInOutContainer>
    </Section>
  );
}

const Section = tw.section`
  p-5
  bg-white
  flex
  flex-col
  gap-5
`;

const ProductCard = tw.div`
  bg-bg-neutral-subtle
  rounded-xl
  p-3
`;

const ProductInfo = tw.div`
  flex
  items-start
  gap-3
`;

const Thumbnail = tw.img`
  w-16
  h-16
  rounded-xl
  object-cover
`;

const ProductDetails = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const ProductName = tw.p`
  text-fg-neutral
  text-base
  font-medium
  leading-5
`;

const OptionInfo = tw.div`
  flex
  flex-col
`;

const OptionName = tw.p`
  text-fg-neutral
  text-base
  font-normal
  leading-5
`;

const SubOptionName = tw.p`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const Divider = tw.div`
  h-px
  bg-stroke-neutral
`;

const CheckInOutContainer = tw.div`
  flex
  gap-2
`;

const CheckInOutItem = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const CheckInOutLabel = tw.p`
  text-fg-muted
  text-base
  font-normal
  leading-5
`;

const CheckInOutValue = tw.p`
  text-fg-neutral
  text-base
  font-medium
  leading-5
`;
