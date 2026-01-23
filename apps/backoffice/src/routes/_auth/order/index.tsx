import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/order/')({
  component: () => <Navigate to="/order/hotel" />,
});
