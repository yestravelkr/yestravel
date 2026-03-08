/**
 * ManagerTable - 파트너 관리자 테이블 컴포넌트
 *
 * 브랜드/인플루언서의 관리자 목록을 테이블 형태로 표시합니다.
 * 역할 변경, 비밀번호 재설정, 관리자 제거 기능을 제공합니다.
 */

import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import type { RoleType } from '@/constants/role';
import { ROLE_VALUES } from '@/constants/role';
import { ActionMenu } from '@/shared/components/ActionMenu';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { Table } from '@/shared/components/table/Table';

export interface PartnerManager {
  /** 관리자 ID */
  id: number;
  /** 이메일 */
  email: string;
  /** 이름 */
  name: string;
  /** 연락처 */
  phoneNumber: string;
  /** 역할 */
  role: string;
  /** 등록일 */
  createdAt: Date | string;
}

export interface ManagerTableProps {
  /** 관리자 목록 */
  managers: PartnerManager[];
  /** 역할 변경 핸들러 */
  onRoleChange: (managerId: number, newRole: RoleType) => void;
  /** 비밀번호 재설정 핸들러 */
  onResetPassword: (managerId: number, managerName: string) => void;
  /** 관리자 제거 핸들러 */
  onRemoveManager: (managerId: number, managerName: string) => void;
}

export const roleOptions = [
  { value: ROLE_VALUES.PARTNER_SUPER, label: '대표 관리자' },
  { value: ROLE_VALUES.PARTNER_STAFF, label: '관리자' },
];

const managerColumnHelper = createColumnHelper<PartnerManager>();

/**
 * Usage:
 * ```tsx
 * <ManagerTable
 *   managers={managers}
 *   onRoleChange={(id, role) => updateRole(id, role)}
 *   onResetPassword={(id, name) => resetPassword(id, name)}
 *   onRemoveManager={(id, name) => removeManager(id, name)}
 * />
 * ```
 */
export function ManagerTable({
  managers,
  onRoleChange,
  onResetPassword,
  onRemoveManager,
}: ManagerTableProps) {
  const columns = useMemo(
    () => [
      managerColumnHelper.accessor('name', {
        header: '이름',
        size: 100,
      }),
      managerColumnHelper.accessor('email', {
        header: '이메일',
        size: 200,
      }),
      managerColumnHelper.accessor('phoneNumber', {
        header: '연락처',
        size: 140,
      }),
      managerColumnHelper.accessor('role', {
        header: '권한',
        size: 150,
        cell: (info) => {
          const role = info.getValue();
          const manager = info.row.original;
          return (
            <SelectDropdown
              options={roleOptions}
              value={role}
              onChange={(newRole) =>
                onRoleChange(manager.id, newRole as RoleType)
              }
              width={130}
            />
          );
        },
      }),
      managerColumnHelper.accessor('createdAt', {
        header: '등록일',
        size: 120,
        cell: (info) => {
          const date = info.getValue();
          return dayjs(date).format('YYYY-MM-DD');
        },
      }),
      managerColumnHelper.display({
        id: 'actions',
        header: '',
        size: 50,
        cell: (info) => {
          const manager = info.row.original;
          return (
            <ActionMenu
              items={[
                {
                  label: '비밀번호 재설정',
                  icon: <RefreshCw size={20} />,
                  onClick: () => onResetPassword(manager.id, manager.name),
                },
                {
                  label: '관리자 목록에서 제거',
                  icon: <Trash2 size={20} />,
                  onClick: () => onRemoveManager(manager.id, manager.name),
                  danger: true,
                },
              ]}
            />
          );
        },
      }),
    ],
    [onRoleChange, onResetPassword, onRemoveManager],
  );

  return <Table columns={columns} data={managers} />;
}
