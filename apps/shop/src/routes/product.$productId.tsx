import { createFileRoute } from '@tanstack/react-router';

import { HotelProductComponent } from '@/components/product/HotelProductComponent';
import { HeaderLayout } from '@/shared/components/HeaderLayout';

export const Route = createFileRoute('/product/$productId')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();

  // TODO: 상품 정보 fetch 필요
  // const { data: product } = trpc.shopProduct.findById.useQuery({ id: Number(productId) });

  // 임시 변수
  const type: string = 'HOTEL';

  const renderProductComponent = () => {
    switch (type) {
      case 'HOTEL':
        return <HotelProductComponent />;
      case 'E-TICKET':
        // return <ETicketProductComponent />;
        return <div>E-TICKET 상품 (준비중)</div>;
      case 'DELIVERY':
        // return <DeliveryProductComponent />;
        return <div>DELIVERY 상품 (준비중)</div>;
      default:
        return <div>지원하지 않는 상품 타입입니다.</div>;
    }
  };

  return (
    <HeaderLayout title="캠페인명">{renderProductComponent()}</HeaderLayout>
  );
}
