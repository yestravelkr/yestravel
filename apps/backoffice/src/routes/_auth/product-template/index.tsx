import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/product-template/')({
  component: ProductTemplateRedirect,
});

function ProductTemplateRedirect() {
  return <Navigate to="/product-template/hotel" />;
}
