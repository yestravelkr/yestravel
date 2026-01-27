/**
 * OrderStatusCard Stories
 *
 * 주문 상태 카드 컴파운드 컴포넌트의 개별 서브 컴포넌트를 테스트합니다.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy } from 'lucide-react';

import { OrderStatusCard, ORDER_STATUS } from './OrderStatusCard';

const meta = {
  title: 'Order/OrderStatusCard',
  component: OrderStatusCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div className="max-w-[375px] bg-bg-layer-base p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrderStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 숙박 - 결제대기 (계좌번호 복사 버튼)
 */
export const AccommodationPendingPayment: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.PENDING_PAYMENT}>
        12월 12일(목)까지 13,000원을 입금해 주세요.
      </OrderStatusCard.Header>
      <OrderStatusCard.AccommodationInfo
        thumbnail="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop"
        hotelName="인천 월미도 고요하우스"
        roomName="로얄 트윈"
        optionName="3인 패키지"
      />
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={{ date: '25.12.10(금)', time: '17:00' }}
        checkOut={{ date: '25.12.14(금)', time: '13:00' }}
      />
      <OrderStatusCard.Actions>
        <OrderStatusCard.SolidButton
          onClick={() => console.log('계좌번호 복사')}
        >
          입금 계좌번호 복사 <Copy size={20} />
        </OrderStatusCard.SolidButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 숙박 - 결제완료 (취소 신청 버튼)
 */
export const AccommodationPaymentCompleted: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.PAYMENT_COMPLETED}>
        결제가 완료되었습니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.AccommodationInfo
        thumbnail="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop"
        hotelName="인천 월미도 고요하우스"
        roomName="로얄 트윈"
        optionName="3인 패키지"
      />
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={{ date: '25.12.10(금)', time: '17:00' }}
        checkOut={{ date: '25.12.14(금)', time: '13:00' }}
      />
      <OrderStatusCard.Actions>
        <OrderStatusCard.SubtleButton onClick={() => console.log('취소 신청')}>
          취소 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 숙박 - 예약확정
 */
export const AccommodationReservationConfirmed: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.RESERVATION_CONFIRMED}>
        예약이 확정되었습니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.AccommodationInfo
        thumbnail="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop"
        hotelName="인천 월미도 고요하우스"
        roomName="로얄 트윈"
        optionName="3인 패키지"
      />
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={{ date: '25.12.10(금)', time: '17:00' }}
        checkOut={{ date: '25.12.14(금)', time: '13:00' }}
      />
      <OrderStatusCard.Actions>
        <OrderStatusCard.SubtleButton onClick={() => console.log('취소 신청')}>
          취소 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 배송 - 결제완료 (단일 상품)
 */
export const ShippingPaymentCompleted: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.PAYMENT_COMPLETED}>
        결제가 완료되었습니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.ProductList>
        <OrderStatusCard.ProductItem
          thumbnail="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop"
          name="우먼즈 집 재킷"
          option="블랙 / M"
          price={17500}
          quantity={1}
        />
      </OrderStatusCard.ProductList>
      <OrderStatusCard.Actions>
        <OrderStatusCard.SubtleButton onClick={() => console.log('주문취소')}>
          주문취소
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 배송 - 배송중 (배송조회 + 반품신청)
 */
export const ShippingInProgress: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.SHIPPING}>
        상품이 배송 중입니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.ProductList>
        <OrderStatusCard.ProductItem
          thumbnail="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop"
          name="우먼즈 집 재킷"
          option="블랙 / M"
          price={17500}
          quantity={1}
        />
      </OrderStatusCard.ProductList>
      <OrderStatusCard.Actions>
        <OrderStatusCard.SolidButton onClick={() => console.log('배송조회')}>
          배송조회
        </OrderStatusCard.SolidButton>
        <OrderStatusCard.SubtleButton onClick={() => console.log('반품 신청')}>
          반품 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 배송 - 여러 상품
 */
export const ShippingMultipleProducts: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.DELIVERED}>
        배송이 완료되었습니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.ProductList>
        <OrderStatusCard.ProductItem
          thumbnail="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop"
          name="우먼즈 집 재킷"
          option="블랙 / M"
          price={17500}
          quantity={1}
        />
        <OrderStatusCard.ProductItem
          thumbnail="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop"
          name="캐시미어 니트"
          option="베이지 / L"
          price={89000}
          quantity={2}
        />
      </OrderStatusCard.ProductList>
      <OrderStatusCard.Actions>
        <OrderStatusCard.SolidButton onClick={() => console.log('구매확정')}>
          구매확정
        </OrderStatusCard.SolidButton>
        <OrderStatusCard.SubtleButton onClick={() => console.log('반품 신청')}>
          반품 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  ),
};

/**
 * 취소완료 상태
 */
export const Cancelled: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.CANCELLED}>
        주문이 취소되었습니다.
      </OrderStatusCard.Header>
      <OrderStatusCard.AccommodationInfo
        thumbnail="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop"
        hotelName="인천 월미도 고요하우스"
        roomName="로얄 트윈"
        optionName="3인 패키지"
      />
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={{ date: '25.12.10(금)', time: '17:00' }}
        checkOut={{ date: '25.12.14(금)', time: '13:00' }}
      />
    </OrderStatusCard>
  ),
};

/**
 * Header만 (상태 설명 없음)
 */
export const HeaderOnly: Story = {
  render: () => (
    <OrderStatusCard>
      <OrderStatusCard.Header status={ORDER_STATUS.PAYMENT_COMPLETED} />
    </OrderStatusCard>
  ),
};

/**
 * 모든 상태 타입 미리보기
 */
export const AllStatusTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {Object.values(ORDER_STATUS).map(status => (
        <OrderStatusCard key={status}>
          <OrderStatusCard.Header status={status}>
            상태 설명 텍스트
          </OrderStatusCard.Header>
        </OrderStatusCard>
      ))}
    </div>
  ),
};

/** 숙박 카드 공통 데이터 */
const accommodationData = {
  thumbnail:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
  hotelName: '인천 월미도 고요하우스',
  roomName: '로얄 트윈',
  optionName: '3인 패키지',
  checkIn: { date: '25.12.10(금)', time: '17:00' },
  checkOut: { date: '25.12.14(금)', time: '13:00' },
};

/** 배송 상품 공통 데이터 */
const shippingProduct = {
  thumbnail:
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop',
  name: '우먼즈 집 재킷',
  option: '블랙 / M',
  price: 17500,
  quantity: 1,
};

/**
 * 전체 보기 - 숙박 + 배송 모든 케이스
 */
export const AllCases: Story = {
  decorators: [
    Story => (
      <div className="max-w-[600px] bg-bg-layer-base p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-8">
      {/* ========== 숙박 주문 상태 ========== */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-fg-neutral">
          숙박 주문 상태
        </h2>
        <div className="flex flex-col gap-4">
          {/* 결제대기 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">결제대기</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.PENDING_PAYMENT}>
                12월 12일(목)까지 13,000원을 입금해 주세요.
              </OrderStatusCard.Header>
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SolidButton>
                  입금 계좌번호 복사 <Copy size={20} />
                </OrderStatusCard.SolidButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 결제완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">결제완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.PAYMENT_COMPLETED} />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 예약대기 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">예약대기</p>
            <OrderStatusCard>
              <OrderStatusCard.Header
                status={ORDER_STATUS.PENDING_RESERVATION}
              />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 예약확정 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">예약확정</p>
            <OrderStatusCard>
              <OrderStatusCard.Header
                status={ORDER_STATUS.RESERVATION_CONFIRMED}
              />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 이용완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">이용완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.COMPLETED} />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
            </OrderStatusCard>
          </div>

          {/* 취소요청 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">취소요청</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.CANCEL_REQUESTED} />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 철회
                </OrderStatusCard.SubtleButton>
                <OrderStatusCard.SubtleButton>
                  취소 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 취소완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">취소완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.CANCELLED} />
              <OrderStatusCard.AccommodationInfo {...accommodationData} />
              <OrderStatusCard.Divider />
              <OrderStatusCard.CheckTime
                checkIn={accommodationData.checkIn}
                checkOut={accommodationData.checkOut}
              />
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>
        </div>
      </section>

      {/* ========== 배송 주문 상태 ========== */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-fg-neutral">
          배송 주문 상태
        </h2>
        <div className="flex flex-col gap-4">
          {/* 결제대기 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">결제대기</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.PENDING_PAYMENT}>
                12월 12일(목)까지 13,000원을 입금해 주세요.
              </OrderStatusCard.Header>
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SolidButton>
                  입금 계좌번호 복사 <Copy size={20} />
                </OrderStatusCard.SolidButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 결제완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">결제완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.PAYMENT_COMPLETED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 배송준비중 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">배송준비중</p>
            <OrderStatusCard>
              <OrderStatusCard.Header
                status={ORDER_STATUS.PREPARING_SHIPMENT}
              />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 배송중 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">배송중</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.SHIPPING} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SolidButton>
                  배송조회
                </OrderStatusCard.SolidButton>
                <OrderStatusCard.SubtleButton>
                  반품 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 배송완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">배송완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.DELIVERED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SolidButton>
                  구매확정
                </OrderStatusCard.SolidButton>
                <OrderStatusCard.SubtleButton>
                  반품 요청
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 구매확정 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">구매확정</p>
            <OrderStatusCard>
              <OrderStatusCard.Header
                status={ORDER_STATUS.PURCHASE_CONFIRMED}
              />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
            </OrderStatusCard>
          </div>

          {/* 취소요청 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">취소요청</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.CANCEL_REQUESTED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 철회
                </OrderStatusCard.SubtleButton>
                <OrderStatusCard.SubtleButton>
                  취소 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 취소완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">취소완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.CANCELLED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  취소 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 반품요청 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">반품요청</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.RETURN_REQUESTED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  반품 철회
                </OrderStatusCard.SubtleButton>
                <OrderStatusCard.SubtleButton>
                  반품 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 반품중 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">반품중</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.RETURNING} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  반품 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>

          {/* 반품완료 */}
          <div>
            <p className="text-sm text-fg-muted mb-2">반품완료</p>
            <OrderStatusCard>
              <OrderStatusCard.Header status={ORDER_STATUS.RETURN_COMPLETED} />
              <OrderStatusCard.ProductList>
                <OrderStatusCard.ProductItem {...shippingProduct} />
              </OrderStatusCard.ProductList>
              <OrderStatusCard.Actions>
                <OrderStatusCard.SubtleButton>
                  반품 상세
                </OrderStatusCard.SubtleButton>
              </OrderStatusCard.Actions>
            </OrderStatusCard>
          </div>
        </div>
      </section>
    </div>
  ),
};
