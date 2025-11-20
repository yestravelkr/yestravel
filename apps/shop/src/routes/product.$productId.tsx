import { createFileRoute } from '@tanstack/react-router';

import { HeaderLayout } from '@/shared/components/HeaderLayout';

export const Route = createFileRoute('/product/$productId')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();

  return (
    <HeaderLayout title="캠페인명">
      <div className="p-5">
        Product ID: <span className="font-semibold">{productId}</span>
      </div>
    </HeaderLayout>
  );
}
