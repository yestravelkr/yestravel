import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { CampaignList } from './_components/CampaignList';

import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/campaign/')({
  component: CampaignListPage,
});

function CampaignListPage() {
  return (
    <MajorPageLayout
      title="캠페인 관리"
      headerActions={
        <CreateButton to="/campaign/create">새 캠페인 생성</CreateButton>
      }
    >
      <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
        <CampaignList />
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
