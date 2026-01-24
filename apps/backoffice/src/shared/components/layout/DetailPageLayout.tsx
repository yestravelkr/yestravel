/**
 * DetailPageLayout - 상세 페이지 레이아웃 컴포넌트
 *
 * 주문 상세 등 2컬럼 구조의 상세 페이지 공통 레이아웃
 * 메인 영역(좌측)과 사이드 패널(우측)로 구성
 * 반응형: 작은 화면에서는 세로로 쌓임
 */

import tw from 'tailwind-styled-components';

interface DetailPageLayoutProps {
  /** 메인 콘텐츠 (좌측) */
  main: React.ReactNode;
  /** 사이드 패널 (우측) */
  side: React.ReactNode;
}

/**
 * Usage:
 * ```tsx
 * <DetailPageLayout
 *   main={<OrderStatusCard ... />}
 *   side={
 *     <>
 *       <PaymentInfoCard ... />
 *       <MemberInfoCard ... />
 *     </>
 *   }
 * />
 * ```
 */
export function DetailPageLayout({ main, side }: DetailPageLayoutProps) {
  return (
    <Container>
      <MainSection>{main}</MainSection>
      <SideSection>{side}</SideSection>
    </Container>
  );
}

const Container = tw.div`
  flex
  flex-col
  xl:flex-row
  gap-5
  items-stretch
  xl:items-start
  w-full
`;

const MainSection = tw.div`
  flex-1
  min-w-0
  xl:flex-[2]
`;

const SideSection = tw.div`
  flex
  flex-col
  gap-5
  w-full
  xl:w-[380px]
  xl:shrink-0
`;
