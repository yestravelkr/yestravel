import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import {
  HotelProductComponent,
  type HotelProductComponentProps,
} from '@/components/product/HotelProductComponent';
import { trpc } from '@/shared';
import { HeaderLayout } from '@/shared/components/HeaderLayout';

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
  const [data] = trpc.shopProduct.getProductDetail.useSuspenseQuery({
    saleId,
  });

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
          thumbnail={data.influencer.thumbnail}
          name={data.influencer.name}
          slug={data.influencer.slug}
        />
      }
    >
      {renderProductComponent()}
    </HeaderLayout>
  );
}

/**
 * 헤더에 표시될 인플루언서 프로필
 */
function InfluencerProfile({
  thumbnail,
  name,
  slug,
}: {
  thumbnail: string | null | undefined;
  name: string;
  slug: string | null | undefined;
}) {
  return (
    <ProfileContainer>
      <ProfileImage src={thumbnail || '/default-profile.png'} alt={name} />
      <ProfileInfo>
        <ProfileName>{name}</ProfileName>
        {slug && <ProfileSlug>@{slug}</ProfileSlug>}
      </ProfileInfo>
    </ProfileContainer>
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

const ProfileContainer = tw.div`
  flex
  items-center
  gap-2
`;

const ProfileImage = tw.img`
  w-8
  h-8
  rounded-full
  object-cover
`;

const ProfileInfo = tw.div`
  flex
  flex-col
`;

const ProfileName = tw.span`
  text-sm
  font-semibold
  text-fg-neutral
  leading-tight
`;

const ProfileSlug = tw.span`
  text-xs
  text-fg-muted
  leading-tight
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
