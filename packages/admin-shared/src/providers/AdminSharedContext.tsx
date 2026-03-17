import { createContext, useContext, type ReactNode } from 'react';
import type { CreateTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@yestravelkr/api-types';

type TrpcClient = CreateTRPCReact<AppRouter, unknown>;

const AdminSharedContext = createContext<TrpcClient | null>(null);

export function AdminSharedProvider({
  trpc,
  children,
}: {
  trpc: TrpcClient;
  children: ReactNode;
}) {
  return (
    <AdminSharedContext.Provider value={trpc}>
      {children}
    </AdminSharedContext.Provider>
  );
}

export function useAdminTrpc(): TrpcClient {
  const ctx = useContext(AdminSharedContext);
  if (!ctx) throw new Error('AdminSharedProvider required');
  return ctx;
}
