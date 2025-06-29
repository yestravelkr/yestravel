import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@yestravelkr/api-types/src/server';

import { useAuthStore } from '../../store/authStore';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      fetch(url, options) {
        // AuthStore에서 토큰 가져오기 (localStorage 사용하지 않음)
        const token = useAuthStore.getState().accessToken;
        return fetch(url, {
          ...options,
          credentials: 'include', // 쿠키를 포함하여 요청
          headers: {
            ...options?.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
      },
    }),
  ],
});
