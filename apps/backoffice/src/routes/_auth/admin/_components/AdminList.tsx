import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { openResetPasswordModal } from './ResetPasswordModal';

import { InboxIcon } from '@/components/icons';
import { ROLE_VALUES, ROLE_LABELS } from '@/constants/role';
import { ActionMenu, Table, EmptyState } from '@/shared/components';
import { openDeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import { trpc } from '@/shared/trpc';
import { useAuthStore } from '@/store';

/** Admin 타입 정의 */
interface Admin {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AdminListProps {
  searchQuery?: string;
}

const columnHelper = createColumnHelper<Admin>();

/** 권한별 배지 스타일 */
const ROLE_BADGE_STYLES: Record<string, string> = {
  [ROLE_VALUES.ADMIN_SUPER]: 'bg-purple-100 text-purple-800',
  [ROLE_VALUES.ADMIN_STAFF]: 'bg-blue-100 text-blue-800',
  [ROLE_VALUES.PARTNER_SUPER]: 'bg-green-100 text-green-800',
  [ROLE_VALUES.PARTNER_STAFF]: 'bg-gray-100 text-gray-800',
};

export function AdminList({ searchQuery = '' }: AdminListProps) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [admins] = trpc.backofficeAdmin.findAll.useSuspenseQuery();
  const { user } = useAuthStore();

  const currentAdmin = useMemo(
    () => admins.find((admin: Admin) => admin.email === user?.email),
    [admins, user?.email],
  );
  const isSuperAdmin = currentAdmin?.role === ROLE_VALUES.ADMIN_SUPER;

  const updatePasswordMutation =
    trpc.backofficeAdmin.updatePassword.useMutation({
      onSuccess: () => {
        toast.success('비밀번호가 변경되었습니다.');
      },
      onError: (error) => {
        toast.error(error.message || '비밀번호 변경에 실패했습니다.');
      },
    });

  const deleteMutation = trpc.backofficeAdmin.delete.useMutation({
    onSuccess: () => {
      utils.backofficeAdmin.findAll.invalidate();
      toast.success('관리자가 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '관리자 삭제에 실패했습니다.');
    },
  });

  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const q = searchQuery.trim().toLowerCase();
    return admins.filter(
      (admin: Admin) =>
        admin.name.toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q) ||
        admin.phoneNumber.toLowerCase().includes(q),
    );
  }, [admins, searchQuery]);

  const columns = [
    columnHelper.accessor('name', {
      header: '이름',
      size: 120,
    }),
    columnHelper.accessor('phoneNumber', {
      header: '연락처',
      size: 150,
    }),
    columnHelper.accessor('email', {
      header: '이메일',
      size: 250,
    }),
    columnHelper.accessor('role', {
      header: '권한',
      size: 150,
      cell: (info) => {
        const role = info.getValue();
        return (
          <RoleBadge
            className={ROLE_BADGE_STYLES[role] ?? 'bg-gray-100 text-gray-800'}
          >
            {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
          </RoleBadge>
        );
      },
    }),
    ...(isSuperAdmin
      ? [
          columnHelper.display({
            id: 'actions',
            header: '',
            size: 50,
            cell: (info) => {
              const admin = info.row.original;
              return (
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    items={[
                      {
                        label: '비밀번호 재설정',
                        icon: <RefreshCw size={20} />,
                        onClick: async () => {
                          const newPassword = await openResetPasswordModal({
                            adminName: admin.name,
                          });
                          if (newPassword) {
                            updatePasswordMutation.mutate({
                              id: admin.id,
                              newPassword,
                            });
                          }
                        },
                      },
                      {
                        label: '관리자 목록에서 제거',
                        icon: <Trash2 size={20} />,
                        danger: true,
                        onClick: async () => {
                          const confirmed = await openDeleteConfirmModal({
                            targetName: admin.name,
                            description: '삭제된 관리자는 복구할 수 없습니다.',
                          });
                          if (confirmed) {
                            deleteMutation.mutate({ id: admin.id });
                          }
                        },
                      },
                    ]}
                  />
                </div>
              );
            },
          }),
        ]
      : []),
  ];

  const handleRowClick = (admin: Admin) => {
    navigate({ to: `/admin/${admin.id}` });
  };

  if (filteredAdmins && filteredAdmins.length > 0) {
    return (
      <Table
        columns={columns}
        data={filteredAdmins}
        onRowClick={handleRowClick}
      />
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

const RoleBadge = tw.span`
  inline-flex
  items-center
  px-2.5
  py-0.5
  rounded-full
  text-xs
  font-medium
`;

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
