import { trpcClient } from '@/shared/trpc/trpc';
import { PartnerType, Role, useAuthStore } from '@/store';

/**
 * fetchAndSetProfile - 프로필을 조회하여 authStore에 반영하는 공통 함수
 *
 * 로그인 성공 후 또는 토큰 갱신 후 프로필 정보를 조회하여
 * authStore의 user와 partnerType을 설정한다.
 */
export function fetchAndSetProfile() {
  const { setUser } = useAuthStore.getState();

  return trpcClient.partnerAccount.getProfile.query().then((profile) => {
    setUser(
      {
        id: profile.id,
        email: profile.email,
        role: profile.role as Role,
        partnerId: profile.partnerId,
      },
      profile.partnerType as PartnerType,
    );
    return profile;
  });
}
