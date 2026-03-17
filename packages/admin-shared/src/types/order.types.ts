import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@yestravelkr/api-types';

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type OrderFilterInput = RouterInputs['backofficeOrder']['findAll'];
export type OrderListItem = RouterOutputs['backofficeOrder']['findAll']['data'][number];
export type OrderDetail = RouterOutputs['backofficeOrder']['findById'];
export type StatusCounts = RouterOutputs['backofficeOrder']['getStatusCounts'];
export type FilterOptions = RouterOutputs['backofficeOrder']['getFilterOptions'];
export type OrderHistory = RouterOutputs['backofficeOrder']['getHistory'];

/** Capability props for controlling which actions are available */
export interface OrderCapabilities {
  canConfirm?: boolean;
  canRevertStatus?: boolean;
  canCancelOrder?: boolean;
  canApproveCancel?: boolean;
  canViewHistory?: boolean;
  canExportExcel?: boolean;
}

/** Default capabilities for Partner (read-only + limited actions) */
export const PARTNER_CAPABILITIES: OrderCapabilities = {
  canConfirm: false,
  canRevertStatus: false,
  canCancelOrder: false,
  canApproveCancel: false,
  canViewHistory: true,
  canExportExcel: true,
};

/** Default capabilities for Backoffice (full access) */
export const BACKOFFICE_CAPABILITIES: OrderCapabilities = {
  canConfirm: true,
  canRevertStatus: true,
  canCancelOrder: true,
  canApproveCancel: true,
  canViewHistory: true,
  canExportExcel: true,
};
