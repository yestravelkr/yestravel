import { redirect } from '@tanstack/react-router';

import { useAuthStore } from '@/store';

export const authBeforeLoad = () => {
  const { isLogin } = useAuthStore.getState();

  if (!isLogin) {
    throw redirect({
      to: '/login',
      search: {
        // redirect: location.href, // 로그인 후 돌아갈 페이지 (선택사항)
      },
    });
  }
};
