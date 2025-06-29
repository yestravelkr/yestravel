import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '../../../../../packages/api-types/src/server';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      fetch(url, options) {
        // TOKEN 임시
        const token = localStorage.getItem('accessToken');
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
