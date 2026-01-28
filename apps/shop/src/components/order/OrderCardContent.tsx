/**
 * OrderCardContent - 주문 카드 컨텐츠 컴포넌트
 *
 * 주문 타입(숙박/배송)에 따라 다른 컨텐츠를 렌더링합니다.
 *
 * Usage:
 * <HotelOrderCardContent order={hotelOrder} onProductClick={handleClick} />
 * <DeliveryOrderCardContent order={deliveryOrder} onProductClick={handleClick} />
 */

import tw from 'tailwind-styled-components';

import { OrderStatusCard } from './OrderStatusCard';

import type { RouterOutput } from '@/shared';

// ============================================================================
// Types
// ============================================================================

type OrderListItem = RouterOutput['shopOrder']['getMyOrders']['orders'][number];

/** 숙박 주문 타입 */
export type HotelOrder = Extract<OrderListItem, { type: 'HOTEL' }>;

/** 배송 주문 타입 */
export type DeliveryOrder = Extract<OrderListItem, { type: 'DELIVERY' }>;

interface OrderCardContentProps<T extends OrderListItem> {
  order: T;
  onProductClick: (saleId: number) => void;
}

// ============================================================================
// Components
// ============================================================================

/**
 * 숙박 주문 카드 컨텐츠
 */
export function HotelOrderCardContent({
  order,
  onProductClick,
}: OrderCardContentProps<HotelOrder>) {
  return (
    <>
      <ProductClickArea onClick={() => onProductClick(order.saleId)}>
        <OrderStatusCard.AccommodationInfo
          thumbnail={order.accommodation.thumbnail ?? null}
          hotelName={order.accommodation.hotelName}
          roomName={order.accommodation.roomName}
          optionName={order.accommodation.optionName}
        />
      </ProductClickArea>
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={{ date: order.checkIn.date, time: order.checkIn.time }}
        checkOut={{ date: order.checkOut.date, time: order.checkOut.time }}
      />
    </>
  );
}

/**
 * 배송 주문 카드 컨텐츠
 */
export function DeliveryOrderCardContent({
  order,
  onProductClick,
}: OrderCardContentProps<DeliveryOrder>) {
  return (
    <ProductClickArea onClick={() => onProductClick(order.saleId)}>
      <OrderStatusCard.ProductList>
        {order.products.map((product, idx) => (
          <OrderStatusCard.ProductItem
            key={idx}
            thumbnail={product.thumbnail ?? null}
            name={product.name}
            option={product.option}
            price={product.price}
            quantity={product.quantity}
          />
        ))}
      </OrderStatusCard.ProductList>
    </ProductClickArea>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const ProductClickArea = tw.div`
  cursor-pointer
  hover:bg-bg-neutral-subtle
  transition-colors
`;
