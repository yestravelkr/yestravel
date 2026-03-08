import { redirect } from '@tanstack/react-router';

import { trpcClient } from '@/shared/trpc/trpc';
import { PartnerType, useAuthStore } from '@/store';

export const authBeforeLoad = async () => {
  const { isLogin, refreshToken, setUser } = useAuthStore.getState();

  // 이미 로그인된 경우 그대로 진행
  if (isLogin) {
    return;
  }

  // 로그인되지 않은 경우 refresh token으로 재시도
  const refreshSuccess = await refreshToken();

  if (!refreshSuccess) {
    throw redirect({
      to: '/login',
      search: { type: undefined },
    });
  }

  // refresh 성공 후 프로필 조회하여 user 정보 복원
  return trpcClient.partnerAccount.getProfile
    .query()
    .then((profile) => {
      setUser(
        {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          partnerId: profile.partnerId,
        },
        profile.partnerType as PartnerType,
      );
    })
    .catch(() => {
      throw redirect({
        to: '/login',
        search: { type: undefined },
      });
    });
};
