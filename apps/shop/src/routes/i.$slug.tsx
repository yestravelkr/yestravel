import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';

export const Route = createFileRoute('/i/$slug')({
  component: InfluencerLayout,
});

/**
 * 인플루언서 레이아웃 - 모든 하위 페이지에 공통 헤더 제공
 */
function InfluencerLayout() {
  const { slug } = Route.useParams();

  if (!slug) {
    return (
      <ErrorContainer>
        <ErrorText>잘못된 인플루언서입니다.</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <Suspense fallback={<HeaderSkeleton />}>
        <InfluencerHeader slug={slug} />
      </Suspense>
      <Outlet />
    </PageContainer>
  );
}

/**
 * 인플루언서 헤더 컴포넌트
 */
function InfluencerHeader({ slug }: { slug: string }) {
  const [influencer] = trpc.shopInfluencer.findBySlug.useSuspenseQuery({
    slug,
  });

  const handleLogin = () => {
    // TODO: 로그인 기능 구현
    alert('로그인 기능 준비 중');
  };

  return (
    <Header>
      <HeaderContent>
        <ProfileSection>
          <ProfileImage
            src={influencer.thumbnail || '/default-profile.png'}
            alt={influencer.name}
          />
          <ProfileInfo>
            <InfluencerName>{influencer.name}</InfluencerName>
            <InfluencerSlug>@{influencer.slug}</InfluencerSlug>
          </ProfileInfo>
        </ProfileSection>
        <LoginButton onClick={handleLogin}>로그인</LoginButton>
      </HeaderContent>
    </Header>
  );
}

/**
 * 헤더 스켈레톤
 */
export function HeaderSkeleton() {
  return (
    <Header>
      <HeaderContent>
        <ProfileSection>
          <SkeletonCircleSmall />
          <ProfileInfo>
            <SkeletonText $width="80px" $height="16px" />
            <SkeletonText $width="60px" $height="14px" />
          </ProfileInfo>
        </ProfileSection>
        <SkeletonButton />
      </HeaderContent>
    </Header>
  );
}

// Styled Components
const PageContainer = tw.div`
  min-h-screen
  bg-gray-50
`;

const Header = tw.header`
  bg-white
  border-b
  border-gray-200
  py-4
`;

const HeaderContent = tw.div`
  max-w-4xl
  mx-auto
  px-4
  flex
  items-center
  justify-between
`;

const ProfileSection = tw.div`
  flex
  items-center
  gap-3
`;

const ProfileImage = tw.img`
  w-12
  h-12
  rounded-full
  object-cover
  border
  border-gray-200
`;

const ProfileInfo = tw.div`
  flex
  flex-col
`;

const InfluencerName = tw.h1`
  text-base
  font-semibold
  text-gray-900
`;

const InfluencerSlug = tw.span`
  text-sm
  text-gray-500
`;

const LoginButton = tw.button`
  px-4
  py-2
  text-sm
  font-medium
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
`;

const ErrorContainer = tw.div`
  flex
  justify-center
  items-center
  min-h-screen
`;

const ErrorText = tw.p`
  text-red-500
  text-lg
`;

// Skeleton Components
const SkeletonCircleSmall = tw.div`
  w-12
  h-12
  rounded-full
  bg-gray-200
  animate-pulse
`;

const SkeletonButton = tw.div`
  w-16
  h-9
  rounded-lg
  bg-gray-200
  animate-pulse
`;

const SkeletonText = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  ${({ $width }) => ($width ? `w-[${$width}]` : 'w-full')}
  ${({ $height }) => ($height ? `h-[${$height}]` : 'h-4')}
`;
