import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { openLoginBottomSheet } from '@/components/auth/LoginBottomSheet';
import {
  HotelProductComponent,
  type HotelProductComponentProps,
} from '@/components/product/HotelProductComponent';
import {
  HeaderLoginButton,
  HeaderLoggedInButtons,
  InfluencerProfile,
} from '@/components/product/ProductHeader';
import { trpc } from '@/shared';
import { HeaderLayout } from '@/shared/components/HeaderLayout';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/sale/$saleId')({
  component: SaleDetailPage,
});

/**
 * 상품 상세 페이지
 * URL: /sale/{saleId}
 */
function SaleDetailPage() {
  const { saleId } = Route.useParams();

  return (
    <Suspense fallback={<SalePageSkeleton />}>
      <SaleDetailContent saleId={Number(saleId)} />
    </Suspense>
  );
}

/**
 * 상품 상세 콘텐츠
 */
function SaleDetailContent({ saleId }: { saleId: number }) {
  const { isLoggedIn, logout } = useAuthStore();
  const [data] = trpc.shopProduct.getProductDetail.useSuspenseQuery({
    saleId,
  });

  const handleLogin = async () => {
    const result = await openLoginBottomSheet();
    if (result?.success) {
      window.location.reload();
    }
  };

  const handleOrderHistory = () => {
    toast.info('주문내역 페이지 준비 중입니다.');
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const renderProductComponent = () => {
    switch (data.type) {
      case 'HOTEL': {
        const props: HotelProductComponentProps = {
          saleId,
          name: data.name,
          thumbnailUrl: data.thumbnailUrl,
          originalPrice: data.originalPrice,
          price: data.price,
          detailHtml: data.detailHtml,
          campaignEndAt: data.campaign.endAt,
          options: {
            skus: data.options.skus,
            hotelOptions: data.options.hotelOptions,
          },
        };
        return <HotelProductComponent {...props} />;
      }
      case 'E-TICKET':
        return <PlaceholderContent>E-TICKET 상품 (준비중)</PlaceholderContent>;
      case 'DELIVERY':
        return <PlaceholderContent>DELIVERY 상품 (준비중)</PlaceholderContent>;
      default:
        return (
          <PlaceholderContent>
            지원하지 않는 상품 타입입니다.
          </PlaceholderContent>
        );
    }
  };

  return (
    <HeaderLayout
      title={
        <InfluencerProfile
          avatarUrl={data.influencer.thumbnail || '/default-profile.png'}
          name={data.influencer.name}
          handle={data.influencer.slug || ''}
        />
      }
      right={
        isLoggedIn ? (
          <HeaderLoggedInButtons
            onOrderHistoryClick={handleOrderHistory}
            onLogoutClick={handleLogout}
          />
        ) : (
          <HeaderLoginButton onClick={handleLogin} />
        )
      }
    >
      {renderProductComponent()}
    </HeaderLayout>
  );
}

/**
 * 로딩 스켈레톤
 */
function SalePageSkeleton() {
  return (
    <SkeletonContainer>
      <SkeletonHeader>
        <SkeletonCircle />
        <SkeletonHeaderText>
          <SkeletonLine $width="80px" />
          <SkeletonLine $width="60px" $height="12px" />
        </SkeletonHeaderText>
      </SkeletonHeader>
      <SkeletonThumbnail />
      <SkeletonContent>
        <SkeletonLine $width="70%" />
        <SkeletonLine $width="40%" />
        <SkeletonLine $width="90%" />
      </SkeletonContent>
    </SkeletonContainer>
  );
}

// Styled Components
const PlaceholderContent = tw.div`
  flex
  items-center
  justify-center
  min-h-[400px]
  text-fg-muted
  text-lg
`;

// Skeleton Styles
const SkeletonContainer = tw.div`
  min-h-screen
  bg-bg-layer-base
  max-w-[600px]
  mx-auto
`;

const SkeletonHeader = tw.div`
  w-full
  h-16
  px-5
  py-4
  bg-white
  border-b
  border-[var(--stroke-neutral)]
  flex
  items-center
  gap-2
`;

const SkeletonCircle = tw.div`
  w-8
  h-8
  rounded-full
  bg-gray-200
  animate-pulse
`;

const SkeletonHeaderText = tw.div`
  flex
  flex-col
  gap-1
`;

const SkeletonThumbnail = tw.div`
  w-full
  aspect-square
  bg-gray-200
  animate-pulse
`;

const SkeletonContent = tw.div`
  p-5
  space-y-3
`;

const SkeletonLine = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  h-4
  w-full
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $height }) => $height && `height: ${$height};`}
`;
