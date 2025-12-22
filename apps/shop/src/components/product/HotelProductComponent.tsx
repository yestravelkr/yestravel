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
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { DeliverySection } from './DeliverySection';
import { openHotelOptionBottomSheet } from './HotelOptionBottomSheet';
import { ProductDetailContent } from './ProductDetailContent';
import { ProductDetailTabs, type ProductDetailTab } from './ProductDetailTabs';
import { InfluencerProfile, HeaderLoginButton } from './ProductHeader';
import { ProductThumbnail } from './ProductThumbnail';
import { ProductTitleSection } from './ProductTitleSection';

import { HeaderLayout } from '@/shared/components/HeaderLayout';

dayjs.locale('ko');

export function HotelProductComponent() {
  const [checkInDate, setCheckInDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<ProductDetailTab>('info');

  // 바텀시트 열기 (구매하기 버튼 클릭 시)
  const handleOpenOptionSheet = () => {
    openHotelOptionBottomSheet({
      config: SAMPLE_CONFIG,
      initialCheckInDate: checkInDate,
      initialCheckOutDate: checkOutDate,
      initialOptionId: selectedOptionId,
    }).then(result => {
      if (result) {
        setCheckInDate(result.checkInDate);
        setCheckOutDate(result.checkOutDate);
        setSelectedOptionId(result.selectedOptionId);
        // TODO: 실제 구매 처리
        console.log('구매 완료:', result);
      }
    });
  };

  // 샘플 상품 정보
  const productInfo = SAMPLE_PRODUCT_INFO;

  return (
    <HeaderLayout
      title={
        <InfluencerProfile
          avatarUrl={productInfo.influencer.avatarUrl}
          name={productInfo.influencer.name}
          handle={productInfo.influencer.handle}
        />
      }
      right={<HeaderLoginButton onClick={() => console.log('로그인 클릭')} />}
    >
      <ContentWrapper>
        {/* 썸네일 */}
        <ProductThumbnail
          imageUrl={productInfo.thumbnailUrl}
          alt={productInfo.name}
        />

        {/* 상품 정보 섹션 */}
        <InfoSection>
          {/* 상품 타이틀 */}
          <ProductTitleSection
            name={productInfo.name}
            originalPrice={productInfo.originalPrice}
            discountedPrice={productInfo.discountedPrice}
            badgeText={productInfo.badgeText}
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
              htmlContent={productInfo.detailHtml}
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
    </HeaderLayout>
  );
}

// 샘플 상품 정보
const SAMPLE_PRODUCT_INFO = {
  name: '고요하우스 - 제주의 조용한 휴식처',
  thumbnailUrl: 'https://placehold.co/600x600',
  originalPrice: 150000,
  discountedPrice: 135000,
  badgeText: '3일 후 종료',
  influencer: {
    avatarUrl: 'https://placehold.co/32x32',
    name: '홍영기',
    handle: 'travel_yg',
  },
  detailHtml: `
    <div style="padding: 20px;">
      <img src="https://placehold.co/600x400" style="width: 100%; margin-bottom: 20px;" />
      <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">고요하우스 소개</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 20px;">
        제주도의 조용한 마을에 위치한 고요하우스는 도심의 소음에서 벗어나
        진정한 휴식을 즐길 수 있는 공간입니다. 넓은 창을 통해 들어오는
        자연광과 함께 편안한 시간을 보내세요.
      </p>
      <img src="https://placehold.co/600x400" style="width: 100%; margin-bottom: 20px;" />
      <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">객실 안내</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 20px;">
        - 기본 객실: 2인 기준, 퀸베드 1개<br/>
        - 조식 포함: 조식 뷔페 2인 제공<br/>
        - 조식 + 레이트 체크아웃: 14시까지 체크아웃 가능
      </p>
      <img src="https://placehold.co/600x400" style="width: 100%;" />
    </div>
  `,
};

// 샘플 데이터: 호텔 옵션 선택기 설정
const SAMPLE_CONFIG: HotelOptionSelectorConfig = {
  skus: Array.from({ length: 30 }, (_, i) => {
    const date = dayjs('2025-11-21').add(i, 'day');
    return {
      id: i + 1,
      quantity: Math.floor(Math.random() * 5) + 1,
      date: date.format('YYYY-MM-DD'),
    };
  }),
  hotelOptions: [
    {
      id: 1,
      name: '기본 객실',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 150000 : 100000];
        })
      ),
    },
    {
      id: 2,
      name: '조식 포함',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 180000 : 130000];
        })
      ),
    },
    {
      id: 3,
      name: '조식 + 레이트 체크아웃',
      priceByDate: Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => {
          const date = dayjs('2025-11-21').add(i, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          return [date.format('YYYY-MM-DD'), isWeekend ? 220000 : 170000];
        })
      ),
    },
  ],
};

/**
 * Usage:
 *
 * <HotelProductComponent />
 */

// Styled Components
const ContentWrapper = tw.div`
  w-full
  max-w-[600px]
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
  border-stroke-neutral
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
