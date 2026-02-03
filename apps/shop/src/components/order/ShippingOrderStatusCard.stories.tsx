/**
 * ShippingOrderStatusCard Stories
 *
 * 배송 주문 상태 카드의 다양한 상태를 표시합니다.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import {
  ShippingOrderStatusCard,
  type ShippingOrderData,
} from './ShippingOrderStatusCard';

const meta = {
  title: 'Order/ShippingOrderStatusCard',
  component: ShippingOrderStatusCard,
  parameters: {
    layout: 'padded',
  },
  args: {
    onTrackDelivery: fn(),
    onReturnRequest: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-[375px] bg-bg-layer-base p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShippingOrderStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 배송 상품 데이터
const baseShippingData: ShippingOrderData = {
  status: 'PAID',
  statusDescription: '결제가 완료되었습니다.',
  products: [
    {
      id: '1',
      thumbnail:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop',
      name: '우먼즈 집 재킷',
      option: '블랙 / M',
      price: 17500,
      quantity: 1,
    },
  ],
};

/**
 * 결제완료 상태 - 단일 상품
 */
export const PaymentCompleted: Story = {
  args: {
    data: baseShippingData,
  },
};

/**
 * 배송준비중 상태
 */
export const PreparingShipment: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'PREPARING_SHIPMENT',
      statusDescription: '상품을 준비 중입니다.',
    },
  },
};

/**
 * 배송중 상태
 */
export const Shipping: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'SHIPPING',
      statusDescription: '상품이 배송 중입니다.',
    },
  },
};

/**
 * 배송완료 상태
 */
export const Delivered: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'DELIVERED',
      statusDescription: '배송이 완료되었습니다.',
    },
  },
};

/**
 * 구매확정 상태
 */
export const PurchaseConfirmed: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'PURCHASE_CONFIRMED',
      statusDescription: '구매가 확정되었습니다.',
    },
  },
};

/**
 * 반품요청 상태
 */
export const ReturnRequested: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'RETURN_REQUESTED',
      statusDescription: '반품 요청이 접수되었습니다.',
    },
  },
};

/**
 * 반품완료 상태
 */
export const ReturnCompleted: Story = {
  args: {
    data: {
      ...baseShippingData,
      status: 'RETURNED',
      statusDescription: '반품이 완료되었습니다.',
    },
  },
};

/**
 * 여러 상품이 있는 경우
 */
export const MultipleProducts: Story = {
  args: {
    data: {
      ...baseShippingData,
      products: [
        {
          id: '1',
          thumbnail:
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop',
          name: '우먼즈 집 재킷',
          option: '블랙 / M',
          price: 17500,
          quantity: 1,
        },
        {
          id: '2',
          thumbnail:
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop',
          name: '캐시미어 니트',
          option: '베이지 / L',
          price: 89000,
          quantity: 2,
        },
        {
          id: '3',
          thumbnail:
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
          name: '러닝화',
          option: '화이트 / 260',
          price: 129000,
          quantity: 1,
        },
      ],
    },
  },
};

/**
 * 썸네일 없는 상품
 */
export const NoThumbnail: Story = {
  args: {
    data: {
      ...baseShippingData,
      products: [
        {
          id: '1',
          thumbnail: null,
          name: '우먼즈 집 재킷',
          option: '블랙 / M',
          price: 17500,
          quantity: 1,
        },
      ],
    },
  },
};

/**
 * 상태 설명 없는 경우
 */
export const NoStatusDescription: Story = {
  args: {
    data: {
      ...baseShippingData,
      statusDescription: undefined,
    },
  },
};
