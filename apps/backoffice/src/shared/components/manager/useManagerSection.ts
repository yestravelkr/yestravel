/**
 * useManagerSection - 파트너 관리자 섹션 훅
 *
 * Brand/Influencer API를 분기하여 관리자 CRUD를 처리합니다.
 * ManagerSection 컴포넌트에 전달할 props를 반환합니다.
 */

import { toast } from 'sonner';

import { openAddManagerModal } from './AddManagerModal';
import type { ManagerSectionProps } from './ManagerSection';
import type { PartnerManager } from './ManagerTable';

import type { RoleType } from '@/constants/role';
import { openDeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import { trpc } from '@/shared/trpc';

interface UseManagerSectionOptions {
  /** 파트너 유형 */
  partnerType: 'brand' | 'influencer';
  /** 파트너 ID */
  partnerId: number;
}

function createMutationOptions(
  invalidateFn: () => void,
  successMsg: string,
  errorMsg: string,
) {
  return {
    onSuccess: () => {
      invalidateFn();
      toast.success(successMsg);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || errorMsg);
    },
  };
}

/**
 * Usage:
 * ```tsx
 * const managerProps = useManagerSection({ partnerType: 'brand', partnerId: 1 });
 * <ManagerSection {...managerProps} />
 * ```
 */
export function useManagerSection({
  partnerType,
  partnerId,
}: UseManagerSectionOptions): ManagerSectionProps {
  const utils = trpc.useUtils();

  const invalidateBrand = () =>
    utils.backofficeBrand.findManagers.invalidate({ brandId: partnerId });
  const invalidateInfluencer = () =>
    utils.backofficeInfluencer.findManagers.invalidate({
      influencerId: partnerId,
    });

  // 두 쿼리 모두 선언, enabled로 분기 (조건부 hooks 금지)
  const brandManagersQuery = trpc.backofficeBrand.findManagers.useQuery(
    { brandId: partnerId },
    { enabled: partnerType === 'brand' },
  );
  const influencerManagersQuery =
    trpc.backofficeInfluencer.findManagers.useQuery(
      { influencerId: partnerId },
      { enabled: partnerType === 'influencer' },
    );

  const managersQuery =
    partnerType === 'brand' ? brandManagersQuery : influencerManagersQuery;

  // Mutations - 두 타입 모두 선언
  const brandCreateMutation = trpc.backofficeBrand.createManager.useMutation(
    createMutationOptions(
      invalidateBrand,
      '관리자가 추가되었습니다.',
      '관리자 추가에 실패했습니다.',
    ),
  );

  const influencerCreateMutation =
    trpc.backofficeInfluencer.createManager.useMutation(
      createMutationOptions(
        invalidateInfluencer,
        '관리자가 추가되었습니다.',
        '관리자 추가에 실패했습니다.',
      ),
    );

  const brandDeleteMutation = trpc.backofficeBrand.deleteManager.useMutation(
    createMutationOptions(
      invalidateBrand,
      '관리자가 제거되었습니다.',
      '관리자 제거에 실패했습니다.',
    ),
  );

  const influencerDeleteMutation =
    trpc.backofficeInfluencer.deleteManager.useMutation(
      createMutationOptions(
        invalidateInfluencer,
        '관리자가 제거되었습니다.',
        '관리자 제거에 실패했습니다.',
      ),
    );

  const brandUpdateRoleMutation =
    trpc.backofficeBrand.updateManagerRole.useMutation(
      createMutationOptions(
        invalidateBrand,
        '권한이 변경되었습니다.',
        '권한 변경에 실패했습니다.',
      ),
    );

  const influencerUpdateRoleMutation =
    trpc.backofficeInfluencer.updateManagerRole.useMutation(
      createMutationOptions(
        invalidateInfluencer,
        '권한이 변경되었습니다.',
        '권한 변경에 실패했습니다.',
      ),
    );

  const managers: PartnerManager[] = (managersQuery.data ?? []).map((m) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    phoneNumber: m.phoneNumber,
    role: m.role,
    createdAt: m.createdAt,
  }));

  const onAddManager = async () => {
    const result = await openAddManagerModal();
    if (!result) return;

    if (partnerType === 'brand') {
      brandCreateMutation.mutate({
        email: result.email,
        password: result.password,
        name: result.name,
        phoneNumber: result.phoneNumber,
        brandId: partnerId,
        role: result.role,
      });
    } else {
      influencerCreateMutation.mutate({
        email: result.email,
        password: result.password,
        name: result.name,
        phoneNumber: result.phoneNumber,
        influencerId: partnerId,
        role: result.role,
      });
    }
  };

  const onRoleChange = (managerId: number, newRole: RoleType) => {
    if (partnerType === 'brand') {
      brandUpdateRoleMutation.mutate({
        id: managerId,
        brandId: partnerId,
        role: newRole,
      });
    } else {
      influencerUpdateRoleMutation.mutate({
        id: managerId,
        influencerId: partnerId,
        role: newRole,
      });
    }
  };

  const onResetPassword = (_managerId: number, managerName: string) => {
    // TODO: 비밀번호 재설정 API 구현 후 연동
    toast.info(`${managerName}님의 비밀번호 재설정 기능은 준비 중입니다.`);
  };

  const onRemoveManager = async (managerId: number, managerName: string) => {
    const confirmed = await openDeleteConfirmModal({
      targetName: managerName,
      description: '삭제된 관리자는 복구할 수 없습니다.',
    });

    if (!confirmed) return;

    if (partnerType === 'brand') {
      brandDeleteMutation.mutate({
        id: managerId,
        brandId: partnerId,
      });
    } else {
      influencerDeleteMutation.mutate({
        id: managerId,
        influencerId: partnerId,
      });
    }
  };

  return {
    managers,
    isLoading: managersQuery.isLoading,
    onAddManager,
    onRoleChange,
    onResetPassword,
    onRemoveManager,
  };
}
