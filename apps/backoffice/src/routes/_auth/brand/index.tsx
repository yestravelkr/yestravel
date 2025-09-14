import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { BrandList } from './_components/BrandList';

import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/brand/')({
  component: BrandListPage,
});

function BrandListPage() {
  return (
    <MajorPageLayout
      title="브랜드 관리"
      headerActions={
        <CreateButton to="/brand/create">새 브랜드 등록</CreateButton>
      }
    >
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <BrandList />
      </Suspense>
    </MajorPageLayout>
  );
}

// 새 브랜드 등록 버튼 - 파란색 배경의 액션 버튼
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
