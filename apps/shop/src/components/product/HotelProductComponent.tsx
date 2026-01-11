/**
 * HotelProductComponent - 호텔 상품 표시 컴포넌트
 *
 * 호텔 타입 상품을 표시하는 컴포넌트입니다.
 * 체크인/체크아웃 날짜 선택, 호텔 옵션 선택, 가격 계산 등을 처리합니다.
 */

import type { HotelOptionSelectorConfig } from '@yestravelkr/option-selector';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';
import tw from 'tailwind-styled-components';

import { DeliverySection } from './DeliverySection';
import { openHotelOptionBottomSheet } from './HotelOptionBottomSheet';
import { ProductDetailContent } from './ProductDetailContent';
import { ProductDetailTabs, type ProductDetailTab } from './ProductDetailTabs';
import { ProductThumbnail } from './ProductThumbnail';
import { ProductTitleSection } from './ProductTitleSection';

dayjs.locale('ko');

/**
 * 호텔 상품 컴포넌트 Props
 */
export interface HotelProductComponentProps {
  /** 판매 ID */
  saleId: number;
  /** 상품명 */
  name: string;
  /** 썸네일 URL */
  thumbnailUrl: string | null | undefined;
  /** 정가 */
  originalPrice: number;
  /** 판매가 */
  price: number;
  /** 상세 HTML 콘텐츠 */
  detailHtml: string | null | undefined;
  /** 캠페인 종료일 (API에서 string으로 올 수 있음) */
  campaignEndAt: Date | string;
  /** 옵션 설정 (HotelOptionSelectorConfig) */
  options: HotelOptionSelectorConfig;
}

/**
 * 캠페인 종료일까지 남은 일수를 계산하여 뱃지 텍스트 반환
 */
function getBadgeText(endAt: Date | string): string {
  const now = dayjs();
  const end = dayjs(endAt);
  const daysLeft = end.diff(now, 'day');

  if (daysLeft <= 0) {
    return '종료됨';
  }
  return `${daysLeft}일 후 종료`;
}

export function HotelProductComponent(props: HotelProductComponentProps) {
  const {
    saleId,
    name,
    thumbnailUrl,
    originalPrice,
    price,
    detailHtml,
    campaignEndAt,
    options,
  } = props;

  // 옵션의 가용 날짜 중 오늘 이후 날짜를 초기값으로 설정
  const { initialCheckIn, initialCheckOut } = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const availableDates = options.skus
      .filter(sku => sku.quantity > 0 && sku.date >= today)
      .map(sku => sku.date)
      .sort();
    const checkIn = availableDates[0] || dayjs().format('YYYY-MM-DD');
    const checkOut =
      availableDates[1] || dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD');
    return { initialCheckIn: checkIn, initialCheckOut: checkOut };
  }, [options.skus]);

  const [checkInDate, setCheckInDate] = useState<string>(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialCheckOut);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<ProductDetailTab>('info');

  // 바텀시트 열기 (구매하기 버튼 클릭 시)
  const handleOpenOptionSheet = () => {
    openHotelOptionBottomSheet({
      saleId,
      config: options,
      initialCheckInDate: checkInDate,
      initialCheckOutDate: checkOutDate,
      initialOptionId: selectedOptionId,
    }).then(result => {
      if (result) {
        setCheckInDate(result.checkInDate);
        setCheckOutDate(result.checkOutDate);
        setSelectedOptionId(result.selectedOptionId);
        console.log('주문 생성 완료:', result.orderNumber);
      }
    });
  };

  const badgeText = getBadgeText(campaignEndAt);

  return (
    <ContentWrapper>
      {/* 썸네일 */}
      <ProductThumbnail
        imageUrl={thumbnailUrl ?? 'https://placehold.co/600x600'}
        alt={name}
      />

      {/* 상품 정보 섹션 */}
      <InfoSection>
        {/* 상품 타이틀 */}
        <ProductTitleSection
          name={name}
          originalPrice={originalPrice}
          discountedPrice={price}
          badgeText={badgeText}
        />

        {/* 배송/체크인 정보 */}
        <DeliverySection
          deliveryFee={0}
          estimatedDelivery={`체크인 ${dayjs(checkInDate).format('MM.DD(ddd)')} · 체크아웃 ${dayjs(checkOutDate).format('MM.DD(ddd)')}`}
        />
      </InfoSection>

      {/* 탭 */}
      <TabSection>
        <ProductDetailTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* 상품정보 탭 내용 */}
        {selectedTab === 'info' && (
          <ProductDetailContent
            htmlContent={detailHtml ?? ''}
            collapsedHeight={400}
          />
        )}

        {/* 판매정보, 추천 탭은 추후 구현 */}
        {selectedTab === 'sale' && (
          <PlaceholderContent>판매정보 (추후 구현)</PlaceholderContent>
        )}
        {selectedTab === 'recommend' && (
          <PlaceholderContent>추천 (추후 구현)</PlaceholderContent>
        )}
      </TabSection>

      {/* 하단 고정 버튼 */}
      <BottomFixedSection>
        <PurchaseButton onClick={handleOpenOptionSheet}>
          구매하기
        </PurchaseButton>
      </BottomFixedSection>

      {/* 플로팅 날짜 선택 버튼 */}
      <FloatingDateButton onClick={handleOpenOptionSheet}>
        <FloatingDateIcon>
          <Calendar size={16} />
        </FloatingDateIcon>
        <FloatingDateText>
          {dayjs(checkInDate).format('YY.MM.DD(ddd)')} ~{' '}
          {dayjs(checkOutDate).format('YY.MM.DD(ddd)')}
        </FloatingDateText>
      </FloatingDateButton>
    </ContentWrapper>
  );
}

/**
 * Usage:
 *
 * <HotelProductComponent
 *   saleId={123}
 *   name="호텔 상품명"
 *   thumbnailUrl="https://example.com/image.jpg"
 *   originalPrice={150000}
 *   price={135000}
 *   detailHtml="<p>상세 내용</p>"
 *   campaignEndAt={new Date('2025-01-31')}
 *   options={{ skus: [...], hotelOptions: [...] }}
 * />
 */

// Styled Components
const ContentWrapper = tw.div`
  w-full
  max-w-[600px]
  mx-auto
  bg-white
  flex
  flex-col
  relative
  pb-24
`;

const InfoSection = tw.div`
  bg-bg-layer-base
  flex
  flex-col
  gap-2
`;

const TabSection = tw.div`
  bg-bg-layer-base
`;

const PlaceholderContent = tw.div`
  p-10
  text-center
  text-fg-muted
  bg-white
`;

const BottomFixedSection = tw.div`
  fixed
  bottom-0
  left-0
  right-0
  p-5
  bg-white
  border-t
  border-[var(--stroke-neutral)]
  flex
  justify-center
`;

const PurchaseButton = tw.button`
  w-full
  max-w-[600px]
  h-12
  bg-bg-neutral-solid
  rounded-xl
  text-base
  font-medium
  text-fg-on-surface
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  transition-colors
`;

const FloatingDateButton = tw.button`
  fixed
  bottom-[108px]
  left-1/2
  -translate-x-1/2
  z-50
  h-11
  min-w-11
  px-3
  bg-bg-neutral-subtle
  rounded-3xl
  shadow-[0px_0px_2px_0px_rgba(0,0,0,0.12),0px_8px_32px_0px_rgba(0,0,0,0.12)]
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-center
  items-center
  gap-1
  hover:bg-bg-neutral
  transition-colors
`;

const FloatingDateIcon = tw.div`
  w-5
  h-5
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const FloatingDateText = tw.span`
  px-1
  text-fg-neutral
  text-base
  font-medium
  leading-5
`;
