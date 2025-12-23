import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';
import { HeaderLayout } from '@/shared/components/HeaderLayout';

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
    <Suspense fallback={<LayoutSkeleton />}>
      <InfluencerLayoutContent slug={slug} />
    </Suspense>
  );
}

/**
 * 인플루언서 레이아웃 콘텐츠 (데이터 로딩 후)
 */
function InfluencerLayoutContent({ slug }: { slug: string }) {
  const [influencer] = trpc.shopInfluencer.findBySlug.useSuspenseQuery({
    slug,
  });

  const handleLogin = () => {
    // TODO: 로그인 기능 구현
    alert('로그인 기능 준비 중');
  };

  return (
    <HeaderLayout
      title={
        <InfluencerProfile
          thumbnail={influencer.thumbnail}
          name={influencer.name}
          slug={influencer.slug}
        />
      }
      right={<LoginButton onClick={handleLogin}>로그인</LoginButton>}
    >
      <Outlet />
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
  thumbnail: string | null;
  name: string;
  slug: string;
}) {
  return (
    <ProfileContainer>
      <ProfileImage src={thumbnail || '/default-profile.png'} alt={name} />
      <ProfileInfo>
        <ProfileName>{name}</ProfileName>
        <ProfileSlug>@{slug}</ProfileSlug>
      </ProfileInfo>
    </ProfileContainer>
  );
}

/**
 * 레이아웃 스켈레톤
 */
function LayoutSkeleton() {
  return (
    <SkeletonContainer>
      <SkeletonHeader>
        <SkeletonProfile>
          <SkeletonCircle />
          <SkeletonProfileText>
            <SkeletonLine $width="80px" />
            <SkeletonLine $width="60px" $height="12px" />
          </SkeletonProfileText>
        </SkeletonProfile>
        <SkeletonButton />
      </SkeletonHeader>
      <SkeletonContent />
    </SkeletonContainer>
  );
}

// Styled Components
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

const LoginButton = tw.button`
  px-3
  py-1.5
  text-sm
  font-medium
  text-fg-neutral
  bg-white
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  hover:bg-bg-neutral-subtle
  transition-colors
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
  justify-between
`;

const SkeletonProfile = tw.div`
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

const SkeletonProfileText = tw.div`
  flex
  flex-col
  gap-1
`;

const SkeletonButton = tw.div`
  w-16
  h-8
  rounded-lg
  bg-gray-200
  animate-pulse
`;

const SkeletonLine = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  h-4
  ${({ $width }) => ($width ? `w-[${$width}]` : 'w-full')}
  ${({ $height }) => $height && `h-[${$height}]`}
`;

const SkeletonContent = tw.div`
  flex-1
  bg-gray-100
`;
