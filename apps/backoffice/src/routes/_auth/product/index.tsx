/**
 * Product List Page - 상품 관리 페이지
 *
 * 등록된 상품들의 목록을 조회하고 관리하는 페이지입니다.
 * 상품 등록 버튼을 통해 새로운 상품을 추가할 수 있습니다.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';

export const Route = createFileRoute('/_auth/product/')({
  component: ProductPage,
});

function ProductPage() {
  return (
    <MajorPageLayout
      title="상품 관리"
      description="등록된 상품을 조회하고 관리할 수 있습니다."
      headerActions={
        <CreateButton to="/product/create">새 상품 등록</CreateButton>
      }
    >
      <CardContent>
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>등록된 상품이 없습니다</EmptyTitle>
          <EmptyDescription>
            새 상품을 등록하여 판매를 시작하세요.
          </EmptyDescription>
          <ActionButton to="/product/create">상품 등록하기</ActionButton>
        </EmptyState>
      </CardContent>
    </MajorPageLayout>
  );
}

// 새 상품 등록 버튼 - 파란색 배경의 액션 버튼
const CreateButton = tw(Link)`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
`;

// 카드형 콘텐츠 영역 - 흰색 배경, 그림자, 테두리
const CardContent = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-8
`;

// 빈 상태를 표시하는 컴포넌트 - 페이지 중앙에 아이콘과 메시지 표시
const EmptyState = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-12
  text-center
`;

// 빈 상태 아이콘 - 큰 이모지 표시
const EmptyIcon = tw.div`
  text-6xl
  mb-4
`;

// 빈 상태 제목 - 중간 크기 굵은 글씨
const EmptyTitle = tw.h2`
  text-xl
  font-semibold
  text-gray-900
  mb-2
`;

// 빈 상태 설명 - 회색 톤 설명 텍스트
const EmptyDescription = tw.p`
  text-gray-600
  mb-6
`;

// 액션 버튼 - 빈 상태에서 보여주는 주요 액션 버튼
const ActionButton = tw(Link)`
  px-6
  py-3
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
  inline-block
`;

/**
 * Usage:
 *
 * 상품 리스트 페이지는 등록된 상품이 없을 때 EmptyState를 보여주고,
 * 상품이 있을 경우 테이블 형태로 리스트를 보여줍니다. (TODO: 구현 예정)
 *
 * 라우트: /product
 */
