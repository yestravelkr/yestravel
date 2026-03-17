import { useAdminTrpc } from '../providers/AdminSharedContext';
import type { OrderFilterInput } from '../types/order.types';

export function useOrderList(input: OrderFilterInput) {
  const trpc = useAdminTrpc();
  return trpc.backofficeOrder.findAll.useSuspenseQuery(input);
}

export function useOrderDetail(orderId: number) {
  const trpc = useAdminTrpc();
  return trpc.backofficeOrder.findById.useSuspenseQuery({ id: orderId });
}

export function useStatusCounts() {
  const trpc = useAdminTrpc();
  return trpc.backofficeOrder.getStatusCounts.useSuspenseQuery();
}

export function useFilterOptions() {
  const trpc = useAdminTrpc();
  return trpc.backofficeOrder.getFilterOptions.useSuspenseQuery();
}

export function useOrderHistory(orderId: number) {
  const trpc = useAdminTrpc();
  return trpc.backofficeOrder.getHistory.useSuspenseQuery({ orderId });
}
