import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@yestravelkr/api-types';

import { useAuthStore } from '../../store/authStore';

// Infer types from the tRPC router
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

const API_BASEURL = import.meta.env.VITE_API_BASEURL || 'http://localhost:3000';

// Token refresh function
const refreshAccessToken = (): Promise<string | null> => {
  return fetch(`${API_BASEURL}/trpc/partnerAuth.refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      return response.json();
    })
    .then((data) => {
      const newAccessToken = data.result?.data?.accessToken;

      if (newAccessToken) {
        useAuthStore.getState().setAccessToken(newAccessToken);
        return newAccessToken;
      }

      return null;
    })
    .catch((error) => {
      console.error('Token refresh error:', error);
      useAuthStore.getState().logout();
      return null;
    });
};

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${API_BASEURL}/trpc`,
      async fetch(url, options) {
        const makeRequest = async (
          token?: string | null,
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

          const newToken = await refreshAccessToken();

          if (newToken) {
            console.log('토큰 refresh 성공, 재시도 중...');
            const retryResponse = await makeRequest(newToken);
            return retryResponse;
          } else {
            console.log('토큰 refresh 실패');
            return response;
          }
        }

        return response;
      },
    }),
  ],
});
