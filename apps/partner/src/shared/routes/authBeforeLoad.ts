import { redirect } from '@tanstack/react-router';

import { useAuthStore } from '@/store';

export const authBeforeLoad = async () => {
  const { isLogin, refreshToken } = useAuthStore.getState();

  // 이미 로그인된 경우 그대로 진행
  if (isLogin) {
    return;
  }

  // 로그인되지 않은 경우 refresh token으로 재시도
  console.log('사용자가 로그인되지 않음, refresh token 시도 중...');
  const refreshSuccess = await refreshToken();

  if (!refreshSuccess) {
    // Refresh 실패 시 로그인 페이지로 리다이렉트
    throw redirect({
      to: '/login',
      search: {},
    });
  }

  console.log('Refresh token 성공, 페이지 접근 허용');
};
