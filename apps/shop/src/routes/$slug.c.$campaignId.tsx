import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';

export const Route = createFileRoute('/$slug/c/$campaignId')({
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { slug, campaignId } = Route.useParams();

  return (
    <Suspense fallback={<CampaignDetailSkeleton />}>
      <CampaignDetail slug={slug} campaignId={Number(campaignId)} />
    </Suspense>
  );
}

/**
 * 할인율 계산
 */
function calculateDiscountRate(
  originalPrice: number,
  price: number
): number | null {
  if (originalPrice <= 0 || price >= originalPrice) {
    return null;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * 가격 포맷팅
 */
function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

/**
 * 날짜 포맷팅
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 캠페인 상세 컴포넌트
 */
function CampaignDetail({
  slug,
  campaignId,
}: {
  slug: string;
  campaignId: number;
}) {
  const [data] = trpc.shopInfluencer.getCampaignDetail.useSuspenseQuery({
    slug,
    campaignId,
  });

  return (
    <PageContainer>
      {/* 캠페인 정보 */}
      <CampaignInfoSection>
        <CampaignTitle>{data.title}</CampaignTitle>
        <CampaignPeriod>
          {formatDate(data.startAt)} ~ {formatDate(data.endAt)}
        </CampaignPeriod>
      </CampaignInfoSection>

      {/* 상품 리스트 */}
      <ProductSection>
        <SectionTitle>판매 상품</SectionTitle>
        {data.products.length === 0 ? (
          <EmptyState>
            <EmptyText>등록된 상품이 없습니다.</EmptyText>
          </EmptyState>
        ) : (
          <ProductGrid>
            {data.products.map(product => {
              const discountRate = calculateDiscountRate(
                product.originalPrice,
                product.price
              );

              return (
                <Link
                  key={product.id}
                  to="/$slug/sale/$saleId"
                  params={{ slug, saleId: String(product.saleId) }}
                >
                  <ProductCard>
                    <ProductThumbnail
                      src={product.thumbnail || '/default-product.png'}
                      alt={product.name}
                    />
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      {discountRate !== null && (
                        <OriginalPrice>
                          {formatPrice(product.originalPrice)}원
                        </OriginalPrice>
                      )}
                      <PriceContainer>
                        {discountRate !== null && (
                          <DiscountRate>{discountRate}%</DiscountRate>
                        )}
                        <CurrentPrice>
                          {formatPrice(product.price)}원
                        </CurrentPrice>
                      </PriceContainer>
                    </ProductInfo>
                  </ProductCard>
                </Link>
              );
            })}
          </ProductGrid>
        )}
      </ProductSection>
    </PageContainer>
  );
}

/**
 * 캠페인 상세 스켈레톤
 */
function CampaignDetailSkeleton() {
  return (
    <PageContainer>
      <CampaignInfoSection>
        <SkeletonText $width="200px" $height="28px" />
        <SkeletonText $width="150px" $height="16px" />
      </CampaignInfoSection>

      <ProductSection>
        <SkeletonText $width="80px" $height="20px" />
        <ProductGrid>
          {[1, 2, 3, 4].map(index => (
            <ProductCard key={index}>
              <SkeletonRect />
              <ProductInfo>
                <SkeletonText $width="100%" $height="16px" />
                <SkeletonText $width="80%" $height="20px" />
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      </ProductSection>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = tw.div`
  max-w-4xl
  mx-auto
  px-4
  py-6
`;

const CampaignInfoSection = tw.div`
  mb-6
  pb-6
  border-b
  border-gray-200
`;

const CampaignTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

const CampaignPeriod = tw.p`
  text-sm
  text-gray-500
`;

const ProductSection = tw.section``;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-4
`;

const ProductGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
`;

const ProductCard = tw.div`
  bg-white
  rounded-xl
  overflow-hidden
  cursor-pointer
  transition-transform
  hover:scale-[1.02]
`;

const ProductThumbnail = tw.img`
  w-full
  aspect-square
  object-cover
`;

const ProductInfo = tw.div`
  p-3
`;

const ProductName = tw.p`
  text-sm
  font-medium
  text-gray-900
  mb-2
  line-clamp-2
`;

const PriceContainer = tw.div`
  flex
  items-center
  gap-2
`;

const DiscountRate = tw.span`
  text-lg
  font-bold
  text-red-500
`;

const CurrentPrice = tw.span`
  text-lg
  font-bold
  text-gray-900
`;

const OriginalPrice = tw.span`
  text-sm
  text-gray-400
  line-through
`;

const EmptyState = tw.div`
  flex
  justify-center
  items-center
  py-16
`;

const EmptyText = tw.p`
  text-gray-500
`;

// Skeleton Components
const SkeletonText = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  ${({ $width }) => ($width ? `w-[${$width}]` : 'w-full')}
  ${({ $height }) => ($height ? `h-[${$height}]` : 'h-4')}
  mb-2
`;

const SkeletonRect = tw.div`
  w-full
  aspect-square
  bg-gray-200
  animate-pulse
`;
