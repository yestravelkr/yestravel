import { z } from 'zod';

import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

export const createHotelOrderInputSchema = z.object({
  saleId: z.number(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  optionId: z.number(),
});

export const createHotelOrderOutputSchema = z.object({
  orderNumber: z.string(),
});

// getTmpOrder
export const getTmpOrderInputSchema = z.object({
  orderNumber: z.string(),
});

const hotelOrderOptionDataSchema = z.object({
  type: z.literal('HOTEL'),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  hotelOptionId: z.number(),
  hotelOptionName: z.string(),
  priceByDate: z.record(z.string(), z.number()),
});

export const getTmpOrderOutputSchema = z.object({
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  totalAmount: z.number(),
  product: z.object({
    name: z.string(),
    thumbnailUrl: z.string().nullish(),
    checkInTime: z.string(),
    checkOutTime: z.string(),
  }),
  orderOptionSnapshot: hotelOrderOptionDataSchema,
});

// updateTmpOrder - 임시 주문 정보 업데이트
export const updateTmpOrderInputSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
});

export const updateTmpOrderOutputSchema = z.object({
  success: z.boolean(),
  customerName: z.string(),
  customerPhone: z.string(),
});

// getOrderDetail - 실제 주문 상세 조회
export const getOrderDetailInputSchema = z.object({
  orderNumber: z.string(),
});

export const getOrderDetailOutputSchema = z.object({
  type: z.literal('accommodation'),
  orderId: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  status: z.string(),
  statusDescription: z.string().nullish(),
  influencerSlug: z.string().nullish(),
  accommodation: z.object({
    thumbnail: z.string().nullish(),
    hotelName: z.string(),
    roomName: z.string(),
    optionName: z.string(),
    hotelOptionId: z.number(),
  }),
  checkIn: z.object({
    date: z.string(),
    time: z.string(),
  }),
  checkOut: z.object({
    date: z.string(),
    time: z.string(),
  }),
  user: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  payment: z.object({
    totalAmount: z.number(),
    productAmount: z.number(),
    paymentMethod: z.string(),
  }),
});

// getMyOrders - 내 주문내역 조회
export const getMyOrdersInputSchema = z.object({
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(20),
});

/** 주문 목록 아이템 - 공통 필드 */
const orderListItemBaseSchema = z.object({
  orderId: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  /** 주문 상태 (DB 값) */
  status: z.string(),
  /** 표시용 상태 (Order.status + Claim.status 합성) */
  displayStatus: z.string(),
  statusDescription: z.string().nullish(),
  totalAmount: z.number(),
  /** 상품 상세 페이지 이동용 */
  influencerSlug: z.string(),
  saleId: z.number(),
});

/** 숙박 주문 목록 아이템 */
const hotelOrderListItemSchema = orderListItemBaseSchema.extend({
  type: z.literal('HOTEL'),
  accommodation: z.object({
    thumbnail: z.string().nullish(),
    hotelName: z.string(),
    roomName: z.string(),
    optionName: z.string(),
  }),
  checkIn: z.object({
    date: z.string(),
    time: z.string(),
  }),
  checkOut: z.object({
    date: z.string(),
    time: z.string(),
  }),
});

/** 배송 주문 목록 아이템 */
const deliveryOrderListItemSchema = orderListItemBaseSchema.extend({
  type: z.literal('DELIVERY'),
  products: z.array(
    z.object({
      thumbnail: z.string().nullish(),
      name: z.string(),
      option: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
});

/** 주문 목록 아이템 (숙박 | 배송) */
export const orderListItemSchema = z.discriminatedUnion('type', [
  hotelOrderListItemSchema,
  deliveryOrderListItemSchema,
]);

export type OrderListItem = z.infer<typeof orderListItemSchema>;
export type HotelOrderListItem = z.infer<typeof hotelOrderListItemSchema>;
export type DeliveryOrderListItem = z.infer<typeof deliveryOrderListItemSchema>;

export const getMyOrdersOutputSchema = z.object({
  orders: z.array(orderListItemSchema),
  total: z.number(),
  hasMore: z.boolean(),
});
