/**
 * Brand List Page - 브랜드 관리 페이지
 *
 * 브랜드 목록을 조회하고 관리하는 페이지입니다.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

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
        <Link to="/brand/create">
          <Button
            kind="neutral"
            variant="solid"
            size="medium"
            leadingIcon={<Plus size={20} />}
          >
            브랜드 등록
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
        <BrandList />
      </Suspense>
    </MajorPageLayout>
  );
}
