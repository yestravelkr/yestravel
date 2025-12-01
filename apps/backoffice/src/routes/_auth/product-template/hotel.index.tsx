import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { ProductTemplateList } from './_components/ProductTemplateList';

import { MajorPageLayout } from '@/components/layout';
import { ProductTypeTabs } from '@/components/product/ProductTypeTabs';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/product-template/hotel/')({
  component: ProductTemplatePage,
});

function ProductTemplatePage() {
  return (
    <MajorPageLayout
      title="품목 관리"
      headerActions={
        <CreateButton to="/product-template/hotel/create">
          새 품목 등록
        </CreateButton>
      }
    >
      <ProductTypeTabs basePath="product-template" />
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <ProductTemplateList />
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
