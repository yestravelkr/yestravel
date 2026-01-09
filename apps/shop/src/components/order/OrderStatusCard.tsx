/**
 * OrderStatusCard - 주문 상태 카드 컴파운드 컴포넌트
 *
 * 주문 상세 페이지에서 주문 상태를 표시하는 컴포넌트입니다.
 * 숙박/배송 등 다양한 주문 유형에 대응할 수 있는 컴파운드 컴포넌트 패턴으로 구현되었습니다.
 *
 * Usage (숙박):
 * <OrderStatusCard>
 *   <OrderStatusCard.Header status="PENDING_PAYMENT">
 *     12월 12일(목)까지 13,000원을 입금해 주세요.
 *   </OrderStatusCard.Header>
 *   <OrderStatusCard.AccommodationInfo
 *     thumbnail="/image.jpg"
 *     hotelName="인천 월미도 고요하우스"
 *     roomName="로얄 트윈"
 *     optionName="3인 패키지"
 *   />
 *   <OrderStatusCard.Divider />
 *   <OrderStatusCard.CheckTime
 *     checkIn={{ date: "25.12.10(금)", time: "17:00" }}
 *     checkOut={{ date: "25.12.14(금)", time: "13:00" }}
 *   />
 *   <OrderStatusCard.Actions>
 *     <OrderStatusCard.SolidButton onClick={handleCopy}>
 *       입금 계좌번호 복사 <Copy size={20} />
 *     </OrderStatusCard.SolidButton>
 *   </OrderStatusCard.Actions>
 * </OrderStatusCard>
 *
 * Usage (배송):
 * <OrderStatusCard>
 *   <OrderStatusCard.Header status="PAYMENT_COMPLETED" />
 *   <OrderStatusCard.ProductList>
 *     <OrderStatusCard.ProductItem
 *       thumbnail="/image.jpg"
 *       name="우먼즈 집 재킷"
 *       option="블랙 / M"
 *       price={17500}
 *       quantity={1}
 *     />
 *   </OrderStatusCard.ProductList>
 *   <OrderStatusCard.Actions>
 *     <OrderStatusCard.SubtleButton>주문취소</OrderStatusCard.SubtleButton>
 *   </OrderStatusCard.Actions>
 * </OrderStatusCard>
 */

import { type ReactNode } from 'react';
import tw from 'tailwind-styled-components';

import { formatPriceExact } from '@/shared';

// ============================================================================
// Types
// ============================================================================

/** 주문 상태 타입 */
export const ORDER_STATUS = {
  // 공통 상태
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',

  // 숙박 전용 상태
  PENDING_RESERVATION: 'PENDING_RESERVATION',
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  COMPLETED: 'COMPLETED',

  // 배송 전용 상태
  PREPARING_SHIPMENT: 'PREPARING_SHIPMENT',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  PURCHASE_CONFIRMED: 'PURCHASE_CONFIRMED',

  // 취소 상태
  CANCEL_REQUESTED: 'CANCEL_REQUESTED',
  CANCELLED: 'CANCELLED',

  // 반품 상태 (배송 전용)
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURN_COMPLETED: 'RETURN_COMPLETED',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** 상태별 라벨 */
const STATUS_LABELS: Record<OrderStatusType, string> = {
  // 공통
  PENDING_PAYMENT: '결제대기',
  PAYMENT_COMPLETED: '결제완료',

  // 숙박
  PENDING_RESERVATION: '예약대기',
  RESERVATION_CONFIRMED: '예약확정',
  COMPLETED: '이용완료',

  // 배송
  PREPARING_SHIPMENT: '배송준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',

  // 취소
  CANCEL_REQUESTED: '취소요청',
  CANCELLED: '취소완료',

  // 반품
  RETURN_REQUESTED: '반품요청',
  RETURN_COMPLETED: '반품완료',
};

// ============================================================================
// Root Component
// ============================================================================

interface OrderStatusCardProps {
  children: ReactNode;
}

function OrderStatusCardRoot({ children }: OrderStatusCardProps) {
  return <Container>{children}</Container>;
}

// ============================================================================
// Header
// ============================================================================

interface HeaderProps {
  /** 주문 상태 */
  status: OrderStatusType;
  /** 상태 설명 (선택적) */
  children?: ReactNode;
}

function Header({ status, children }: HeaderProps) {
  const statusLabel = STATUS_LABELS[status];

  return (
    <HeaderContainer>
      <StatusTitle>{statusLabel}</StatusTitle>
      {children && <StatusDescription>{children}</StatusDescription>}
    </HeaderContainer>
  );
}

// ============================================================================
// Accommodation Info (숙박 전용)
// ============================================================================

interface AccommodationInfoProps {
  /** 썸네일 이미지 URL */
  thumbnail: string | null;
  /** 호텔명 */
  hotelName: string;
  /** 객실명 */
  roomName: string;
  /** 옵션명 */
  optionName: string;
}

function AccommodationInfo({
  thumbnail,
  hotelName,
  roomName,
  optionName,
}: AccommodationInfoProps) {
  return (
    <ProductInfoContainer>
      <Thumbnail
        src={thumbnail || '/default-product.png'}
        alt={hotelName}
        loading="lazy"
      />
      <ProductDetails>
        <ProductTitle>{hotelName}</ProductTitle>
        <ProductSubInfo>
          <ProductSubText>{roomName}</ProductSubText>
          <ProductSubTextMuted>{optionName}</ProductSubTextMuted>
        </ProductSubInfo>
      </ProductDetails>
    </ProductInfoContainer>
  );
}

// ============================================================================
// Check Time (숙박 전용)
// ============================================================================

interface CheckTimeProps {
  checkIn: {
    date: string;
    time: string;
  };
  checkOut: {
    date: string;
    time: string;
  };
}

function CheckTime({ checkIn, checkOut }: CheckTimeProps) {
  return (
    <CheckTimeContainer>
      <CheckTimeColumn>
        <CheckTimeLabel>체크인</CheckTimeLabel>
        <CheckTimeValue>
          <span>{checkIn.date}</span>
          <span>{checkIn.time}</span>
        </CheckTimeValue>
      </CheckTimeColumn>
      <CheckTimeColumn>
        <CheckTimeLabel>체크아웃</CheckTimeLabel>
        <CheckTimeValue>
          <span>{checkOut.date}</span>
          <span>{checkOut.time}</span>
        </CheckTimeValue>
      </CheckTimeColumn>
    </CheckTimeContainer>
  );
}

// ============================================================================
// Product List & Item (배송 전용)
// ============================================================================

interface ProductListProps {
  children: ReactNode;
}

function ProductList({ children }: ProductListProps) {
  return <ProductListContainer>{children}</ProductListContainer>;
}

interface ProductItemProps {
  /** 썸네일 이미지 URL */
  thumbnail: string | null;
  /** 상품명 */
  name: string;
  /** 옵션 (색상, 사이즈 등) */
  option: string;
  /** 가격 */
  price: number;
  /** 수량 */
  quantity: number;
}

function ProductItem({
  thumbnail,
  name,
  option,
  price,
  quantity,
}: ProductItemProps) {
  return (
    <ProductInfoContainer>
      <Thumbnail
        src={thumbnail || '/default-product.png'}
        alt={name}
        loading="lazy"
      />
      <ProductDetails>
        <ProductTitle>{name}</ProductTitle>
        <ProductSubTextMuted>{option}</ProductSubTextMuted>
        <ProductPriceRow>
          <ProductPrice>{formatPriceExact(price)}</ProductPrice>
          <ProductQuantity>{quantity}개</ProductQuantity>
        </ProductPriceRow>
      </ProductDetails>
    </ProductInfoContainer>
  );
}

// ============================================================================
// Divider
// ============================================================================

function Divider() {
  return <DividerLine />;
}

// ============================================================================
// Actions & Buttons
// ============================================================================

interface ActionsProps {
  children: ReactNode;
}

function Actions({ children }: ActionsProps) {
  return <ActionsContainer>{children}</ActionsContainer>;
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function SolidButton({ children, onClick, disabled }: ButtonProps) {
  return (
    <SolidButtonStyled onClick={onClick} disabled={disabled}>
      {children}
    </SolidButtonStyled>
  );
}

function SubtleButton({ children, onClick, disabled }: ButtonProps) {
  return (
    <SubtleButtonStyled onClick={onClick} disabled={disabled}>
      {children}
    </SubtleButtonStyled>
  );
}

// ============================================================================
// Compound Component Export
// ============================================================================

export const OrderStatusCard = Object.assign(OrderStatusCardRoot, {
  Header,
  AccommodationInfo,
  CheckTime,
  ProductList,
  ProductItem,
  Divider,
  Actions,
  SolidButton,
  SubtleButton,
});

// ============================================================================
// Styled Components
// ============================================================================

const Container = tw.div`
  bg-white
  p-5
  flex
  flex-col
  gap-5
`;

const HeaderContainer = tw.div`
  flex
  flex-col
  gap-1
`;

const StatusTitle = tw.h2`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const StatusDescription = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const ProductInfoContainer = tw.div`
  flex
  gap-3
  items-start
`;

const Thumbnail = tw.img`
  w-[52px]
  h-[52px]
  rounded-xl
  object-cover
  border
  border-[rgba(0,0,0,0.05)]
  flex-shrink-0
`;

const ProductDetails = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const ProductTitle = tw.p`
  text-[16.5px]
  font-medium
  leading-[22px]
  text-fg-neutral
`;

const ProductSubInfo = tw.div`
  flex
  flex-col
`;

const ProductSubText = tw.p`
  text-[15px]
  leading-5
  text-fg-neutral
`;

const ProductSubTextMuted = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const ProductPriceRow = tw.div`
  flex
  items-center
  gap-1
`;

const ProductPrice = tw.span`
  text-[15px]
  leading-5
  text-fg-neutral
  font-medium
`;

const ProductQuantity = tw.span`
  text-[15px]
  leading-5
  text-fg-muted
`;

const CheckTimeContainer = tw.div`
  flex
  gap-2
`;

const CheckTimeColumn = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const CheckTimeLabel = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const CheckTimeValue = tw.div`
  flex
  flex-col
  text-[16.5px]
  font-medium
  leading-[22px]
  text-fg-neutral
`;

const ProductListContainer = tw.div`
  flex
  flex-col
  gap-4
`;

const DividerLine = tw.div`
  h-px
  bg-stroke-neutral
`;

const ActionsContainer = tw.div`
  flex
  gap-2
`;

const SolidButtonStyled = tw.button`
  flex-1
  h-11
  bg-bg-neutral-solid
  text-fg-on-surface
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:opacity-90
  transition-opacity
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const SubtleButtonStyled = tw.button`
  flex-1
  h-11
  bg-bg-neutral
  text-fg-neutral
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:opacity-90
  transition-opacity
  disabled:opacity-50
  disabled:cursor-not-allowed
`;
