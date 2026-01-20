import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@yestravelkr/api-types';

import { useAuthStore } from '@/store/authStore';

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

/**
 * Race condition 방지를 위한 refresh promise 캐시
 * 여러 요청이 동시에 401을 받아도 한 번만 refresh 실행
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh token을 사용해서 새 access token 발급
 */
const refreshAccessToken = async (): Promise<boolean> => {
  // 이미 refresh 진행 중이면 기존 Promise 재사용
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      useAuthStore.getState().logout();
      return false;
    }

    try {
      const response = await fetch(`${getApiUrl()}/shopAuth.refreshToken`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: { refreshToken } }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const result = data.result?.data?.json ?? data.result?.data;

      if (result?.accessToken) {
        useAuthStore.getState().login(
          {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
          result.member
        );
        return true;
      }

      return false;
    } catch {
      useAuthStore.getState().logout();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: getApiUrl(),
      async fetch(url, options) {
        const makeRequest = async (
          token?: string | null
        ): Promise<Response> => {
          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              ...options?.headers,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
        };

        // 첫 번째 시도
        const token = useAuthStore.getState().accessToken;
        const response = await makeRequest(token);

        // 401 에러인 경우 토큰 refresh 시도
        if (response.status === 401 && token) {
          const success = await refreshAccessToken();

          if (success) {
            const newToken = useAuthStore.getState().accessToken;
            return makeRequest(newToken);
          }
        }

        return response;
      },
    }),
  ],
});
