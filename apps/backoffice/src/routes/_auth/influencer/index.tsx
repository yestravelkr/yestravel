/**
 * Influencer List Page - 인플루언서 관리 페이지
 *
 * 인플루언서 목록을 조회하고 관리하는 페이지입니다.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

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
        <Link to="/influencer/create">
          <Button
            kind="neutral"
            variant="solid"
            size="medium"
            leadingIcon={<Plus size={20} />}
          >
            인플루언서 등록
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
        <InfluencerList />
      </Suspense>
    </MajorPageLayout>
  );
}
