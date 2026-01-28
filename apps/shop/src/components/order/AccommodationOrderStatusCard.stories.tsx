/**
 * AccommodationOrderStatusCard Stories
 *
 * 숙박 주문 상태 카드의 다양한 상태를 표시합니다.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import {
  AccommodationOrderStatusCard,
  type AccommodationOrderData,
} from './AccommodationOrderStatusCard';

const meta = {
  title: 'Order/AccommodationOrderStatusCard',
  component: AccommodationOrderStatusCard,
  parameters: {
    layout: 'padded',
  },
  args: {
    onCancelRequest: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-[375px] bg-bg-layer-base p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccommodationOrderStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 숙박 데이터
const baseAccommodationData: AccommodationOrderData = {
  status: 'PENDING_PAYMENT',
  statusDescription: '12월 12일(목)까지 13,000원을 입금해 주세요.',
  accommodation: {
    thumbnail:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
    hotelName: '인천 월미도 고요하우스',
    roomName: '로얄 트윈',
    optionName: '3인 패키지',
  },
  checkIn: {
    date: '25.12.10(금)',
    time: '17:00',
  },
  checkOut: {
    date: '25.12.14(금)',
    time: '13:00',
  },
};

/**
 * 결제대기 상태
 */
export const PendingPayment: Story = {
  args: {
    data: baseAccommodationData,
  },
};

/**
 * 결제완료 상태
 */
export const PaymentCompleted: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'PAYMENT_COMPLETED',
      statusDescription: '결제가 완료되었습니다.',
    },
  },
};

/**
 * 예약대기 상태
 */
export const PendingReservation: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'PENDING_RESERVATION',
      statusDescription: '숙소에서 예약을 확인 중입니다.',
    },
  },
};

/**
 * 예약확정 상태
 */
export const ReservationConfirmed: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'RESERVATION_CONFIRMED',
      statusDescription: '예약이 확정되었습니다.',
    },
  },
};

/**
 * 이용완료 상태
 */
export const Completed: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'COMPLETED',
      statusDescription: '이용이 완료되었습니다.',
    },
  },
};

/**
 * 취소요청 상태
 */
export const CancelRequested: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'CANCEL_REQUESTED',
      statusDescription: '취소 요청이 접수되었습니다.',
    },
  },
};

/**
 * 취소완료 상태
 */
export const Cancelled: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      status: 'CANCELLED',
      statusDescription: '주문이 취소되었습니다.',
    },
  },
};

/**
 * 썸네일 없는 경우
 */
export const NoThumbnail: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      accommodation: {
        ...baseAccommodationData.accommodation,
        thumbnail: null,
      },
    },
  },
};

/**
 * 상태 설명 없는 경우
 */
export const NoStatusDescription: Story = {
  args: {
    data: {
      ...baseAccommodationData,
      statusDescription: undefined,
    },
  },
};
