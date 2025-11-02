import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { ROLE_VALUES, ROLE_LABELS } from '@/constants/role';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';

// Admin 타입 정의
interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function AdminList() {
  const navigate = useNavigate();
  const [admins] = trpc.backofficeAdmin.findAll.useSuspenseQuery();

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

  const columnHelper = createColumnHelper<Admin>();

  const columns = [
    columnHelper.accessor('name', {
      header: '이름',
      cell: (info) => (
        <div>
          <AdminName>{info.getValue()}</AdminName>
          <AdminEmail>{info.row.original.email}</AdminEmail>
        </div>
      ),
      size: 350,
    }),
    columnHelper.accessor('role', {
      header: '권한',
      cell: (info) => getRoleBadge(info.getValue()),
      size: 250,
    }),
    columnHelper.display({
      id: 'status',
      header: '상태',
      cell: () => (
        <StatusBadge className="bg-green-100 text-green-800">활성</StatusBadge>
      ),
      size: 150,
    }),
    columnHelper.display({
      id: 'lastLogin',
      header: '마지막 로그인',
      cell: () => <LastLogin>-</LastLogin>,
      size: 250,
    }),
  ];

  const handleRowClick = (admin: Admin) => {
    navigate({ to: `/admin/${admin.id}` });
  };

  if (admins && admins.length > 0) {
    return (
      <Table columns={columns} data={admins} onRowClick={handleRowClick} />
    );
  }

  return (
    <EmptyState
      icon={<InboxIcon />}
      title="등록된 관리자가 없습니다"
      description="새로운 관리자를 추가하여 권한을 관리하세요."
      action={
        <CreateButton to="/admin/create">첫 관리자 추가하기</CreateButton>
      }
    />
  );
}

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
