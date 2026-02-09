import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@yestravelkr/api-types';

import { useAuthStore, waitForHydration } from '@/store/authStore';

// Infer types from the tRPC router
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

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
 *
 * - 401/403 (인증 실패): logout 수행
 * - 5xx/네트워크 에러: logout하지 않고 false 반환 (일시적 장애)
 */
const refreshAccessToken = async (): Promise<boolean> => {
  // 이미 refresh 진행 중이면 기존 Promise 재사용
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      // hydration 미완료 시 토큰이 null일 수 있으므로 바로 logout하지 않음
      if (!useAuthStore.getState().isHydrated) {
        return false;
      }
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

      // 인증 실패 (refresh token 만료/무효): logout
      if (response.status === 401 || response.status === 403) {
        useAuthStore.getState().logout();
        return false;
      }

      // 서버 에러 (5xx 등): 일시적 장애이므로 logout하지 않음
      if (!response.ok) {
        return false;
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
      // 네트워크 에러 (TypeError 등): 일시적 장애이므로 logout하지 않음
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

        // hydration 완료 대기 후 토큰 사용
        await waitForHydration();

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
