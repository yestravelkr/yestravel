/**
 * ManagerSection - 파트너 관리자 섹션 컴포넌트
 *
 * Card로 래핑된 관리자 목록 섹션입니다.
 * "사용자" 제목과 "관리자 추가" 버튼, 테이블 또는 빈 상태를 표시합니다.
 */

import tw from 'tailwind-styled-components';

import { ManagerTable, type PartnerManager } from './ManagerTable';

import { Card } from '@/shared/components/card/Card';

export interface ManagerSectionProps {
  /** 관리자 목록 */
  managers: PartnerManager[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 관리자 추가 핸들러 */
  onAddManager: () => void;
  /** 역할 변경 핸들러 */
  onRoleChange: (managerId: number, newRole: string) => void;
  /** 비밀번호 재설정 핸들러 */
  onResetPassword: (managerId: number, managerName: string) => void;
  /** 관리자 제거 핸들러 */
  onRemoveManager: (managerId: number, managerName: string) => void;
}

/**
 * Usage:
 * ```tsx
 * const managerProps = useManagerSection({ partnerType: 'brand', partnerId: 1 });
 * <ManagerSection {...managerProps} />
 * ```
 */
export function ManagerSection({
  managers,
  isLoading,
  onAddManager,
  onRoleChange,
  onResetPassword,
  onRemoveManager,
}: ManagerSectionProps) {
  return (
    <Card title="사용자">
      <HeaderRow>
        <AddButton type="button" onClick={onAddManager}>
          관리자 추가
        </AddButton>
      </HeaderRow>

      {isLoading ? (
        <EmptyMessage>로딩 중...</EmptyMessage>
      ) : managers.length > 0 ? (
        <ManagerTable
          managers={managers}
          onRoleChange={onRoleChange}
          onResetPassword={onResetPassword}
          onRemoveManager={onRemoveManager}
        />
      ) : (
        <EmptyMessage>등록된 사용자가 없습니다.</EmptyMessage>
      )}
    </Card>
  );
}

// ============================================
// Styled Components
// ============================================

const HeaderRow = tw.div`
  flex justify-end
`;

const AddButton = tw.button`
  h-9
  px-4
  bg-[var(--bg-primary-solid,#18181B)]
  rounded-xl
  text-white
  text-[15px]
  font-medium
  leading-5
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;

const EmptyMessage = tw.div`
  text-[var(--fg-muted)]
  text-sm
  py-4
  text-center
`;
