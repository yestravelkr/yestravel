/**
 * CampaignList - 인플루언서 캠페인 목록 컴포넌트
 *
 * 인플루언서의 진행중/오픈예정 캠페인과 상품을 표시합니다.
 *
 * Usage:
 * <CampaignList slug="influencer-slug" />
 */

import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';

dayjs.locale('ko');

export interface CampaignListProps {
  slug: string;
}

// ============================================================================
// Utils
// ============================================================================

/** 2자리 년도 날짜 포맷 (25.01.01) */
function formatShortDate(date: Date | string): string {
  return dayjs(date).format('YY.MM.DD');
}

/** 요일 포함 날짜 포맷 (25.01.01(금)) */
function formatDateWithDay(date: Date | string): string {
  return dayjs(date).format('YY.MM.DD(dd)');
}

/** 가격 포맷 (26,890원~) */
function formatPrice(price: number): string {
  return `${price.toLocaleString()}원~`;
}

type CampaignStatusType = 'upcoming' | 'ongoing' | 'ending';

/** 캠페인 상태 계산 */
function getCampaignStatus(
  startAt: Date | string,
  endAt: Date | string
): { type: CampaignStatusType; label: string } {
  const now = dayjs();
  const start = dayjs(startAt);
  const end = dayjs(endAt);

  if (now.isBefore(start)) {
    return { type: 'upcoming', label: '오픈 예정' };
  }

  const daysUntilEnd = end.diff(now, 'day') + 1;

  if (daysUntilEnd <= 3) {
    return { type: 'ending', label: `${daysUntilEnd}일 후 종료` };
  }

  return { type: 'ongoing', label: `${daysUntilEnd}일 후 종료` };
}

/** 상품 오픈 예정 여부 체크 */
function isProductUpcoming(
  saleStartAt: Date | string | null | undefined,
  campaignStartAt: Date | string
): boolean {
  const now = dayjs();
  const startDate = dayjs(saleStartAt ?? campaignStartAt);
  return now.isBefore(startDate);
}

// ============================================================================
// Components
// ============================================================================

export function CampaignList({ slug }: CampaignListProps) {
  const [data] = trpc.shopInfluencer.getCampaigns.useSuspenseQuery({ slug });

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
          <CampaignSection key={campaign.id}>
            <CampaignHeader>
              <StatusBadge $type={status.type}>
                <BadgeDot $type={status.type} />
                <BadgeText>{status.label}</BadgeText>
              </StatusBadge>

              <Link
                to="/i/$slug/c/$campaignId"
                params={{ slug, campaignId: String(campaign.id) }}
              >
                <CampaignTitleRow>
                  <CampaignTitle>{campaign.title}</CampaignTitle>
                  <ChevronRightIcon />
                </CampaignTitleRow>
              </Link>

              <CampaignPeriod>
                {formatShortDate(campaign.startAt)} ~{' '}
                {formatShortDate(campaign.endAt)}
              </CampaignPeriod>
            </CampaignHeader>

            <ProductScrollContainer>
              {campaign.products.map(product => {
                const productIsUpcoming = isProductUpcoming(
                  product.saleStartAt,
                  campaign.startAt
                );

                const cardContent = (
                  <ProductCard>
                    <ProductThumbnailWrapper>
                      <ProductThumbnail
                        src={product.thumbnail || '/default-product.png'}
                        alt={product.name}
                      />
                      {productIsUpcoming && (
                        <ProductOverlay>
                          <OverlayText>
                            {formatDateWithDay(
                              product.saleStartAt || campaign.startAt
                            )}
                          </OverlayText>
                          <OverlayText>오픈예정</OverlayText>
                        </ProductOverlay>
                      )}
                    </ProductThumbnailWrapper>
                    <ProductName>{product.name}</ProductName>
                    {!productIsUpcoming && (
                      <ProductPrice>{formatPrice(product.price)}</ProductPrice>
                    )}
                  </ProductCard>
                );

                if (productIsUpcoming) {
                  return <div key={product.id}>{cardContent}</div>;
                }

                return (
                  <Link
                    key={product.id}
                    to="/sale/$saleId"
                    params={{ saleId: String(product.saleId) }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </ProductScrollContainer>

            {isUpcoming && (
              <NotifyButtonContainer>
                <NotifyButton
                  onClick={() => toast.info('알림 기능 준비 중입니다')}
                >
                  <Bell size={20} className="text-fg-placeholder" />
                  오픈알림 받기
                </NotifyButton>
              </NotifyButtonContainer>
            )}
          </CampaignSection>
        );
      })}
    </CampaignListContainer>
  );
}

export function CampaignListSkeleton() {
  return (
    <CampaignListContainer>
      {[1, 2].map(index => (
        <CampaignSection key={index}>
          <CampaignHeader>
            <SkeletonBadge />
            <SkeletonTitle />
            <SkeletonPeriod />
          </CampaignHeader>
          <ProductScrollContainer>
            {[1, 2, 3].map(productIndex => (
              <ProductCard key={productIndex}>
                <SkeletonThumbnail />
                <SkeletonProductName />
                <SkeletonPrice />
              </ProductCard>
            ))}
          </ProductScrollContainer>
        </CampaignSection>
      ))}
    </CampaignListContainer>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="16"
      viewBox="0 0 9 16"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M0.21967 0.21967C0.512563 -0.0732233 0.987324 -0.0732233 1.28022 0.21967L8.28022 7.21967C8.57311 7.51256 8.57311 7.98732 8.28022 8.28022L1.28022 15.2802C0.987324 15.5731 0.512563 15.5731 0.21967 15.2802C-0.0732232 14.9873 -0.0732232 14.5126 0.21967 14.2197L6.6894 7.74994L0.21967 1.28022C-0.0732233 0.987324 -0.0732233 0.512563 0.21967 0.21967Z"
        fill="#9E9E9E"
      />
    </svg>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const CampaignListContainer = tw.div`
  pb-8
`;

const CampaignSection = tw.div`
  pt-8
`;

const CampaignHeader = tw.div`
  px-5
  mb-4
  flex
  flex-col
  gap-2
`;

const StatusBadge = tw.div<{ $type: CampaignStatusType }>`
  h-5
  px-1.5
  rounded
  inline-flex
  items-center
  gap-1
  w-fit
  ${({ $type }) =>
    $type === 'upcoming' ? 'bg-bg-neutral-solid' : 'bg-bg-primary-solid'}
`;

const BadgeDot = tw.div<{ $type: CampaignStatusType }>`
  w-2
  h-2
  rounded-full
  ${({ $type }) =>
    $type === 'upcoming' ? 'bg-fg-on-surface' : 'bg-fg-neutral-inverted'}
`;

const BadgeText = tw.span`
  text-xs
  font-medium
  text-fg-on-surface
`;

const CampaignTitleRow = tw.div`
  flex
  items-center
  justify-between
  gap-2
  cursor-pointer
  hover:opacity-80
  transition-opacity
`;

const CampaignTitle = tw.h2`
  text-[21px]
  font-bold
  text-fg-neutral
  leading-7
  flex-1
`;

const CampaignPeriod = tw.p`
  text-[13.5px]
  text-fg-neutral
  leading-[18px]
`;

const ProductScrollContainer = tw.div`
  flex
  gap-3
  overflow-x-auto
  pl-5
  pr-3
  pb-2
  scrollbar-hide
`;

const ProductCard = tw.div`
  flex-shrink-0
  w-40
  flex
  flex-col
  gap-2
`;

const ProductThumbnailWrapper = tw.div`
  relative
  w-40
  h-40
  rounded-xl
  overflow-hidden
  bg-bg-neutral-subtle
`;

const ProductThumbnail = tw.img`
  w-full
  h-full
  object-cover
`;

const ProductOverlay = tw.div`
  absolute
  inset-0
  bg-black/60
  flex
  flex-col
  items-center
  justify-center
  gap-0.5
`;

const OverlayText = tw.span`
  text-[16.5px]
  font-medium
  text-white
  text-center
  leading-[22px]
`;

const ProductName = tw.p`
  text-[15px]
  text-fg-neutral
  leading-5
  line-clamp-2
`;

const ProductPrice = tw.p`
  text-lg
  font-bold
  text-fg-neutral
  leading-6
`;

const NotifyButtonContainer = tw.div`
  mt-4
  px-5
`;

const NotifyButton = tw.button`
  w-full
  h-11
  bg-bg-neutral-solid
  text-fg-on-surface
  font-medium
  text-[16.5px]
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  leading-[22px]
  hover:opacity-90
  transition-opacity
`;

const EmptyState = tw.div`
  flex
  justify-center
  items-center
  py-16
`;

const EmptyText = tw.p`
  text-fg-muted
  text-lg
`;

// Skeleton Components
const SkeletonBadge = tw.div`
  w-20
  h-5
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonTitle = tw.div`
  w-48
  h-7
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonPeriod = tw.div`
  w-32
  h-5
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;

const SkeletonThumbnail = tw.div`
  w-40
  h-40
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
  w-20
  h-6
  bg-bg-neutral-subtle
  rounded
  animate-pulse
`;
