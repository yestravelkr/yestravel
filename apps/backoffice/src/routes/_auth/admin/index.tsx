import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { Plus, Search } from 'lucide-react';
import { Suspense, useState } from 'react';

import { AdminList } from './_components/AdminList';

import { MajorPageLayout } from '@/components/layout';
import { Input, ListPageLayout, TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/admin/')({
  component: AdminListPage,
});

function AdminListPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <MajorPageLayout
      title="관리자 계정 관리"
      headerActions={
        <Link to="/admin/create">
          <Button
            kind="neutral"
            variant="solid"
            size="medium"
            leadingIcon={<Plus size={20} />}
          >
            관리자 추가
          </Button>
        </Link>
      }
    >
      <ListPageLayout
        filters={
          <div className="flex justify-start">
            <div className="w-[280px]">
              <Input
                prefix={<Search size={14} className="text-[var(--fg-muted)]" />}
                placeholder="이름, 연락처, 이메일 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        }
        table={
          <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
            <AdminList searchQuery={searchQuery} />
          </Suspense>
        }
      />
    </MajorPageLayout>
  );
}
