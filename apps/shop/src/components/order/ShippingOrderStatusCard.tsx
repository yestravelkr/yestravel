/**
 * ShippingOrderStatusCard - 배송 주문 상태 카드
 *
 * 배송 주문의 상태를 표시하는 컴포넌트입니다.
 * OrderStatusCard 컴파운드 컴포넌트를 사용합니다.
 *
 * Usage:
 * <ShippingOrderStatusCard
 *   data={shippingOrderData}
 *   onTrackDelivery={() => console.log('배송 조회')}
 *   onReturnRequest={() => console.log('반품 신청')}
 * />
 */

import { OrderStatusCard, type OrderStatusType } from './OrderStatusCard';

export interface ShippingProduct {
  id: string;
  thumbnail: string | null;
  name: string;
  option: string;
  price: number;
  quantity: number;
}

export interface ShippingOrderData {
  status: OrderStatusType;
  statusDescription?: string;
  products: ShippingProduct[];
}

export interface ShippingOrderStatusCardProps {
  data: ShippingOrderData;
  onTrackDelivery: () => void;
  onReturnRequest: () => void;
}

export function ShippingOrderStatusCard({
  data,
  onTrackDelivery,
  onReturnRequest,
}: ShippingOrderStatusCardProps) {
  return (
    <OrderStatusCard>
      <OrderStatusCard.Header status={data.status}>
        {data.statusDescription}
      </OrderStatusCard.Header>
      <OrderStatusCard.ProductList>
        {data.products.map(product => (
          <OrderStatusCard.ProductItem
            key={product.id}
            thumbnail={product.thumbnail}
            name={product.name}
            option={product.option}
            price={product.price}
            quantity={product.quantity}
          />
        ))}
      </OrderStatusCard.ProductList>
      <OrderStatusCard.Actions>
        <OrderStatusCard.SolidButton onClick={onTrackDelivery}>
          배송조회
        </OrderStatusCard.SolidButton>
        <OrderStatusCard.SubtleButton onClick={onReturnRequest}>
          반품 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  );
}
