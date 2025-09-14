import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';

export const Route = createFileRoute('/_auth/product/')({
  component: ProductPage,
});

function ProductPage() {
  return (
    <MajorPageLayout
      title="품목 관리"
      description="상품 품목을 관리할 수 있습니다."
    >
      <CardContent>
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>품목 관리 페이지</EmptyTitle>
          <EmptyDescription>
            품목 관련 기능이 구현될 예정입니다.
          </EmptyDescription>
        </EmptyState>
      </CardContent>
    </MajorPageLayout>
  );
}

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
`;
