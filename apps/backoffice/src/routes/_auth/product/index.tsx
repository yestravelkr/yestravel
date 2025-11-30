import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/product/')({
  component: ProductRedirect,
});

function ProductRedirect() {
  return <Navigate to="/product/hotel" />;
}
