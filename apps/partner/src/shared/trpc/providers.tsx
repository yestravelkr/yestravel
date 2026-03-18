import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminSharedProvider } from '@yestravelkr/admin-shared';

import { trpc, trpcClient } from './trpc.ts';

const queryClient = new QueryClient();
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AdminSharedProvider trpc={trpc}>{children}</AdminSharedProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
