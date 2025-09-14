import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { AdminList } from './_components/AdminList';

import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/admin/')({
  component: AdminListPage,
});

function AdminListPage() {
  return (
    <MajorPageLayout
      title="관리자 계정 관리"
      headerActions={
        <CreateButton to="/admin/create">새 관리자 추가</CreateButton>
      }
    >
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <AdminList />
      </Suspense>
    </MajorPageLayout>
  );
}

// 새 관리자 추가 버튼 - 파란색 배경의 액션 버튼
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
