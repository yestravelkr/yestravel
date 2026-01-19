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
 * Refresh token을 사용해서 새 access token 발급
 */
const refreshAccessToken = async (): Promise<boolean> => {
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
  } catch (error) {
    console.error('Token refresh error:', error);
    useAuthStore.getState().logout();
    return false;
  }
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
          console.log('토큰 만료 감지, refresh 시도 중...');

          const success = await refreshAccessToken();

          if (success) {
            console.log('토큰 refresh 성공, 재시도 중...');
            const newToken = useAuthStore.getState().accessToken;
            return makeRequest(newToken);
          } else {
            console.log('토큰 refresh 실패');
          }
        }

        return response;
      },
    }),
  ],
});
