import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { MajorPageLayout } from '@/components/layout';
import { ROLE_VALUES, ROLE_LABELS } from '@/constants/role';
import { Table, EmptyState, TableSkeleton } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/admin/')({
  component: AdminListPage,
});

function AdminListPage() {
  const navigate = useNavigate();
  const { data: admins, isLoading } = trpc.backofficeAdmin.findAll.useQuery();

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      [ROLE_VALUES.ADMIN_SUPER]: 'bg-purple-100 text-purple-800',
      [ROLE_VALUES.ADMIN_STAFF]: 'bg-blue-100 text-blue-800',
      [ROLE_VALUES.PARTNER_SUPER]: 'bg-green-100 text-green-800',
      [ROLE_VALUES.PARTNER_STAFF]: 'bg-gray-100 text-gray-800',
    };

    return (
      <RoleBadge className={roleStyles[role as keyof typeof roleStyles]}>
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
      </RoleBadge>
    );
  };

  const columns = [
    {
      key: 'name',
      header: '이름',
      render: (admin: any) => (
        <div>
          <AdminName>{admin.name}</AdminName>
          <AdminEmail>{admin.email}</AdminEmail>
        </div>
      ),
      width: '35%',
    },
    {
      key: 'role',
      header: '권한',
      render: (admin: any) => getRoleBadge(admin.role),
      width: '25%',
    },
    {
      key: 'status',
      header: '상태',
      render: () => (
        <StatusBadge className="bg-green-100 text-green-800">활성</StatusBadge>
      ),
      width: '15%',
    },
    {
      key: 'lastLogin',
      header: '마지막 로그인',
      render: () => <LastLogin>-</LastLogin>,
      width: '25%',
    },
  ];

  const handleRowClick = (admin: any) => {
    navigate({ to: `/admin/${admin.id}` });
  };

  return (
    <MajorPageLayout
      title="관리자 계정 관리"
      headerActions={
        <CreateButton to="/admin/create">새 관리자 추가</CreateButton>
      }
    >
      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : admins && admins.length > 0 ? (
        <Table columns={columns} data={admins} onRowClick={handleRowClick} />
      ) : (
        <EmptyState
          icon={<InboxIcon />}
          title="등록된 관리자가 없습니다"
          description="새로운 관리자를 추가하여 권한을 관리하세요."
          action={
            <CreateButton to="/admin/create">첫 관리자 추가하기</CreateButton>
          }
        />
      )}
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

const AdminName = tw.div`
  font-medium
  text-gray-900
`;

const AdminEmail = tw.div`
  text-sm
  text-gray-500
`;

const RoleBadge = tw.span`
  inline-flex
  items-center
  px-2.5
  py-0.5
  rounded-full
  text-xs
  font-medium
`;

const StatusBadge = tw.span`
  inline-flex
  items-center
  px-2.5
  py-0.5
  rounded-full
  text-xs
  font-medium
`;

const LastLogin = tw.div`
  text-sm
  text-gray-500
`;
