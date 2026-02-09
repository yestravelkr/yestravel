import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import { trpc, trpcClient } from './trpc';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // 인증 에러(UNAUTHORIZED)는 재시도하지 않음
        const trpcError = error as { data?: { httpStatus?: number } };
        if (trpcError?.data?.httpStatus === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/*<ReactQueryDevtools initialIsOpen={false} />*/}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
