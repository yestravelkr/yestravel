/**
 * 캠페인 상세 페이지
 *
 * 부모 레이아웃(i.$slug.tsx)에서 HeaderLayout 헤더를 상속받음
 * 캠페인 정보, 상품 목록, 플로팅 날짜 버튼을 표시합니다.
 */

import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { CampaignInfo } from '@/components/campaign/CampaignInfo';
import { FloatingDateButton } from '@/components/campaign/FloatingDateButton';
import { ProductGrid } from '@/components/campaign/ProductGrid';
import { trpc } from '@/shared';

export const Route = createFileRoute('/i/$slug/c/$campaignId')({
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { slug, campaignId } = Route.useParams();

  return (
    <Suspense fallback={<CampaignDetailSkeleton />}>
      <CampaignDetailContent slug={slug} campaignId={Number(campaignId)} />
    </Suspense>
  );
}

interface CampaignDetailContentProps {
  slug: string;
  campaignId: number;
}

function CampaignDetailContent({
  slug,
  campaignId,
}: CampaignDetailContentProps) {
  const [data] = trpc.shopInfluencer.getCampaignDetail.useSuspenseQuery({
    slug,
    campaignId,
  });

  const handleDateButtonClick = () => {
    toast.info('날짜 선택 기능 준비 중입니다');
  };

  return (
    <Container>
      <CampaignInfo
        title={data.title}
        startAt={data.startAt}
        endAt={data.endAt}
      />
      <ProductGrid
        products={data.products.map(product => ({
          id: product.id,
          saleId: product.saleId,
          thumbnail: product.thumbnail,
          name: product.name,
          originalPrice: product.originalPrice,
          price: product.price,
        }))}
      />
      <FloatingDateButton
        startAt={data.startAt}
        endAt={data.endAt}
        onClick={handleDateButtonClick}
      />
      <BottomSpacer />
    </Container>
  );
}

function CampaignDetailSkeleton() {
  return (
    <Container>
      <SkeletonInfoWrapper>
        <SkeletonBadge />
        <SkeletonTitle />
        <SkeletonPeriod />
      </SkeletonInfoWrapper>
      <SkeletonGrid>
        {[1, 2, 3, 4].map(index => (
          <SkeletonCard key={index}>
            <SkeletonThumbnail />
            <SkeletonProductName />
            <SkeletonPrice />
          </SkeletonCard>
        ))}
      </SkeletonGrid>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  pb-8
`;

const BottomSpacer = tw.div`
  h-20
`;

// Skeleton Components
const SkeletonInfoWrapper = tw.div`
  flex
  flex-col
  items-center
  gap-3
  px-5
  py-8
`;

const SkeletonBadge = tw.div`
  w-24
  h-5
  bg-bg-neutral-subtle
  rounded-lg
  animate-pulse
`;

const SkeletonTitle = tw.div`
  w-64
  h-7
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonPeriod = tw.div`
  w-40
  h-5
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonGrid = tw.div`
  grid
  grid-cols-1
  sm:grid-cols-2
  gap-x-3
  gap-y-5
  px-5
`;

const SkeletonCard = tw.div`
  flex
  flex-col
  gap-2
`;

const SkeletonThumbnail = tw.div`
  aspect-square
  w-full
  bg-bg-neutral-subtle
  rounded-xl
  animate-pulse
`;

const SkeletonProductName = tw.div`
  w-full
  h-5
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonPrice = tw.div`
  w-24
  h-6
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;
