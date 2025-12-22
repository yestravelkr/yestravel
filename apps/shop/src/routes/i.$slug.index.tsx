import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';

export const Route = createFileRoute('/i/$slug/')({
  component: InfluencerIndexPage,
});

function InfluencerIndexPage() {
  const { slug } = Route.useParams();

  return (
    <Suspense fallback={<CampaignListSkeleton />}>
      <CampaignList slug={slug} />
    </Suspense>
  );
}

/**
 * 캠페인 상태 계산
 */
function getCampaignStatus(
  startAt: Date | string,
  endAt: Date | string
): {
  type: 'upcoming' | 'ongoing' | 'ending';
  label: string;
} {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) {
    const daysUntilOpen = Math.ceil(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { type: 'upcoming', label: `${daysUntilOpen}일 후 오픈` };
  }

  const daysUntilEnd = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEnd <= 3) {
    return { type: 'ending', label: `${daysUntilEnd}일 후 종료` };
  }

  return { type: 'ongoing', label: `${daysUntilEnd}일 후 종료` };
}

/**
 * 캠페인 리스트 컴포넌트
 */
function CampaignList({ slug }: { slug: string }) {
  const [data] = trpc.shopInfluencer.getCampaigns.useSuspenseQuery({
    slug,
  });

  if (data.campaigns.length === 0) {
    return (
      <EmptyState>
        <EmptyText>진행 중인 캠페인이 없습니다.</EmptyText>
      </EmptyState>
    );
  }

  return (
    <CampaignListContainer>
      {data.campaigns.map(campaign => {
        const status = getCampaignStatus(campaign.startAt, campaign.endAt);
        const isUpcoming = status.type === 'upcoming';

        return (
          <CampaignCard key={campaign.id}>
            {/* 캠페인 헤더 */}
            <CampaignHeader>
              <StatusBadge $type={status.type}>{status.label}</StatusBadge>
              <Link
                to="/i/$slug/c/$campaignId"
                params={{
                  slug,
                  campaignId: String(campaign.id),
                }}
              >
                <CampaignTitleRow>
                  <CampaignTitle>{campaign.title}</CampaignTitle>
                  <ChevronRight size={20} />
                </CampaignTitleRow>
              </Link>
              <CampaignPeriod>
                {formatDate(campaign.startAt)} ~ {formatDate(campaign.endAt)}
              </CampaignPeriod>
            </CampaignHeader>

            {/* 상품 리스트 (가로 스크롤) */}
            <ProductScrollContainer>
              {campaign.products.map(product => (
                <Link
                  key={product.id}
                  to="/i/$slug/sale/$saleId"
                  params={{ slug, saleId: String(product.saleId) }}
                >
                  <ProductCard>
                    <ProductThumbnail
                      src={product.thumbnail || '/default-product.png'}
                      alt={product.name}
                    />
                    <ProductName>{product.name}</ProductName>
                  </ProductCard>
                </Link>
              ))}
            </ProductScrollContainer>

            {/* 오픈 예정인 경우 알림 버튼 */}
            {isUpcoming && (
              <NotifyButtonContainer>
                <NotifyButton onClick={() => alert('알림 신청 기능 준비 중')}>
                  오픈 알림 받기
                </NotifyButton>
              </NotifyButtonContainer>
            )}
          </CampaignCard>
        );
      })}
    </CampaignListContainer>
  );
}

/**
 * 날짜 포맷팅 함수
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 캠페인 리스트 스켈레톤
 */
function CampaignListSkeleton() {
  return (
    <CampaignListContainer>
      {[1, 2].map(index => (
        <CampaignCard key={index}>
          <CampaignHeader>
            <SkeletonText $width="80px" $height="20px" />
            <SkeletonText $width="200px" $height="24px" />
            <SkeletonText $width="150px" $height="16px" />
          </CampaignHeader>
          <ProductScrollContainer>
            {[1, 2, 3, 4].map(productIndex => (
              <ProductCard key={productIndex}>
                <SkeletonRect />
                <SkeletonText $width="100%" $height="16px" />
              </ProductCard>
            ))}
          </ProductScrollContainer>
        </CampaignCard>
      ))}
    </CampaignListContainer>
  );
}

// Styled Components
const CampaignListContainer = tw.div`
  max-w-4xl
  mx-auto
  px-4
  py-8
  space-y-6
`;

const CampaignCard = tw.div`
  bg-white
  rounded-xl
  shadow-sm
  border
  border-gray-200
  p-6
`;

const CampaignHeader = tw.div`
  mb-4
`;

const StatusBadge = tw.span<{ $type: 'upcoming' | 'ongoing' | 'ending' }>`
  inline-block
  px-2
  py-1
  text-xs
  font-medium
  rounded
  mb-2
  ${({ $type }) => {
    switch ($type) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ending':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }}
`;

const CampaignTitleRow = tw.div`
  flex
  items-center
  justify-between
  cursor-pointer
  hover:opacity-80
  transition-opacity
`;

const CampaignTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
`;

const CampaignPeriod = tw.p`
  text-sm
  text-gray-500
  mt-1
`;

const ProductScrollContainer = tw.div`
  flex
  gap-3
  overflow-x-auto
  pb-2
  -mx-2
  px-2
  scrollbar-hide
`;

const ProductCard = tw.div`
  flex-shrink-0
  w-28
`;

const ProductThumbnail = tw.img`
  w-28
  h-28
  object-cover
  rounded-lg
  mb-2
`;

const ProductName = tw.p`
  text-sm
  text-gray-700
  font-medium
  truncate
`;

const NotifyButtonContainer = tw.div`
  mt-4
  pt-4
  border-t
  border-gray-100
`;

const NotifyButton = tw.button`
  w-full
  py-3
  bg-blue-500
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-600
  transition-colors
`;

const EmptyState = tw.div`
  flex
  justify-center
  items-center
  py-16
`;

const EmptyText = tw.p`
  text-gray-500
  text-lg
`;

// Skeleton Components
const SkeletonText = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  ${({ $width }) => ($width ? `w-[${$width}]` : 'w-full')}
  ${({ $height }) => ($height ? `h-[${$height}]` : 'h-4')}
`;

const SkeletonRect = tw.div`
  w-full
  aspect-square
  bg-gray-200
  rounded-lg
  animate-pulse
`;
