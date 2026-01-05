import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@yestravelkr/api-types';

export const trpc = createTRPCReact<AppRouter>();

// 개발 환경에서 모바일 테스트를 위해 현재 호스트 사용
const getApiUrl = () => {
  // 환경변수가 있으면 사용
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 개발 환경: 현재 호스트의 3000 포트 사용
  if (import.meta.env.DEV) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000/trpc`;
  }

  // 프로덕션 기본값
  return 'http://localhost:3000/trpc';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: getApiUrl(),
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options?.headers,
          },
        });
      },
    }),
  ],
});
