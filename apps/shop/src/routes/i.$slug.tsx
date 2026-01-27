import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { openLoginBottomSheet } from '@/components/auth/LoginBottomSheet';
import {
  HeaderLoginButton,
  HeaderLoggedInButtons,
  InfluencerProfile,
} from '@/components/product/ProductHeader';
import { trpc } from '@/shared';
import { HeaderLayout } from '@/shared/components/HeaderLayout';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/i/$slug')({
  component: InfluencerLayout,
});

/**
 * 인플루언서 레이아웃 - 모든 하위 페이지에 공통 헤더 제공
 * HeaderLayout을 사용하여 상품 상세 페이지와 동일한 헤더 스타일 적용
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
    <Suspense fallback={<InfluencerLayoutSkeleton />}>
      <InfluencerLayoutContent slug={slug} />
    </Suspense>
  );
}

/**
 * 인플루언서 레이아웃 콘텐츠 - 데이터 로딩 후 렌더링
 */
function InfluencerLayoutContent({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuthStore();
  const [influencer] = trpc.shopInfluencer.findBySlug.useSuspenseQuery({
    slug,
  });

  const handleLogin = async () => {
    const result = await openLoginBottomSheet();
    if (result?.success) {
      // 로그인 성공 시 페이지 새로고침하여 상태 반영
      window.location.reload();
    }
  };

  const handleOrderHistory = () => {
    navigate({ to: '/my-orders' });
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <HeaderLayout
      left={
        <InfluencerProfile
          avatarUrl={influencer.thumbnail || '/default-profile.png'}
          name={influencer.name}
          handle={influencer.slug}
        />
      }
      title=""
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
      <Outlet />
    </HeaderLayout>
  );
}

/**
 * 인플루언서 레이아웃 스켈레톤
 */
function InfluencerLayoutSkeleton() {
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
  gap-3
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
  h-9
  rounded-xl
  bg-gray-200
  animate-pulse
`;

const SkeletonLine = tw.div<{ $width?: string; $height?: string }>`
  bg-gray-200
  rounded
  animate-pulse
  h-4
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $height }) => $height && `height: ${$height};`}
`;
