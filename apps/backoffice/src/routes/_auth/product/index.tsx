import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { ProductList } from './_components/ProductList';

import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/product/')({
  component: ProductPage,
});

function ProductPage() {
  return (
    <MajorPageLayout
      title="품목 관리"
      headerActions={
        <CreateButton to="/product/create">새 품목 등록</CreateButton>
      }
    >
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <ProductList />
      </Suspense>
    </MajorPageLayout>
  );
}

// 새 품목 등록 버튼 - 파란색 배경의 액션 버튼
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
