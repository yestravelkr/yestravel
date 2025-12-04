import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { InfluencerList } from './_components/InfluencerList';

import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/influencer/')({
  component: InfluencerListPage,
});

function InfluencerListPage() {
  return (
    <MajorPageLayout
      title="인플루언서 관리"
      headerActions={
        <CreateButton to="/influencer/create">새 인플루언서 등록</CreateButton>
      }
    >
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <InfluencerList />
      </Suspense>
    </MajorPageLayout>
  );
}

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
