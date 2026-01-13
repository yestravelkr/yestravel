/**
 * NewOrderPage - 주문서 작성 페이지
 *
 * 임시 주문 데이터를 기반으로 주문서를 작성하고 결제를 진행합니다.
 * URL: /new-order/{orderNumber}
 */

import type { PaymentRequest } from '@portone/browser-sdk/v2';
import * as PortOne from '@portone/browser-sdk/v2';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Suspense, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import {
  HotelProductSection,
  UserInputSection,
  PaymentMethodSection,
  PaymentAmountSection,
  PaymentAgreementSection,
  type PaymentType,
  type PaymentMethod,
} from '@/components/new-order';
import { API_BASEURL } from '@/constants';
import { trpc } from '@/shared';

export interface NewOrderFormData {
  userName: string;
  userPhone: string;
  useSameAsMe: boolean;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
}

export const Route = createFileRoute('/new-order/$orderNumber')({
  component: NewOrderPage,
});

function NewOrderPage() {
  const { orderNumber } = Route.useParams();

  return (
    <Suspense fallback={<NewOrderSkeleton />}>
      <NewOrderContent orderNumber={orderNumber} />
    </Suspense>
  );
}

function NewOrderContent({ orderNumber }: { orderNumber: string }) {
  const navigate = useNavigate();
  const [data] = trpc.shopOrder.getTmpOrder.useSuspenseQuery({ orderNumber });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<NewOrderFormData>({
    defaultValues: {
      userName: '',
      userPhone: '',
      useSameAsMe: false,
      paymentType: 'simple',
      paymentMethod: 'kakaopay',
    },
  });

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const paymentComplete = async (paymentResult: unknown) => {
    await axios.post(
      `${API_BASEURL}/trpc/shopPayment.complete`,
      paymentResult,
      {
        withCredentials: true,
      }
    );
  };

  const handleSubmit = async () => {
    const formData = methods.getValues();

    if (!formData.userName.trim() || !formData.userPhone.trim()) {
      toast.error('예약자 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentMethod: PaymentRequest = {
        storeId: 'store-225e8f7c-301b-421e-bd54-189066bbb97e',
        channelKey: 'channel-key-be836e0a-6537-4a86-bf9d-f99211e0be6c',
        paymentId: orderNumber,
        orderName: `YesTravel - ${data.product.name}`,
        totalAmount: data.totalAmount,
        currency: 'KRW',
        payMethod: 'CARD',
        customer: {
          customerId: orderNumber,
          fullName: formData.userName,
          phoneNumber: formData.userPhone.replace(/-/g, ''),
        },
        redirectUrl: `${API_BASEURL}/payment/complete-redirect?origin=${window.location.origin}`,
      };

      const response = await PortOne.requestPayment(paymentMethod);

      if (!response || response.code === 'FAILURE_TYPE_PG') {
        toast.error('결제가 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      // 결제 승인 요청
      await paymentComplete(response);

      toast.success('결제가 완료되었습니다.');

      // 주문 상세 페이지로 이동
      navigate({ to: '/order/$orderNumber', params: { orderNumber } });
    } catch (error) {
      console.error('결제 오류:', error);
      toast.error('결제 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={24} />
          </BackButton>
          <HeaderTitle>주문</HeaderTitle>
          <HeaderSpacer />
        </Header>

        <ContentWrapper>
          <HotelProductSection
            thumbnailUrl={data.product.thumbnailUrl ?? null}
            productName={data.product.name}
            optionName={data.orderOptionSnapshot.hotelOptionName}
            checkInDate={data.orderOptionSnapshot.checkInDate}
            checkInTime={data.product.checkInTime}
            checkOutDate={data.orderOptionSnapshot.checkOutDate}
            checkOutTime={data.product.checkOutTime}
          />

          <UserInputSection />

          <PaymentMethodSection />

          <PaymentAmountSection
            productAmount={data.totalAmount}
            totalAmount={data.totalAmount}
          />

          <PaymentAgreementSection
            totalAmount={data.totalAmount}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ContentWrapper>
      </Container>
    </FormProvider>
  );
}

function NewOrderSkeleton() {
  return (
    <Container>
      <Header>
        <SkeletonBox $width="24px" $height="24px" />
        <HeaderTitle>주문</HeaderTitle>
        <HeaderSpacer />
      </Header>
      <ContentWrapper>
        <SkeletonSection>
          <SkeletonBox $width="100%" $height="120px" />
        </SkeletonSection>
        <SkeletonSection>
          <SkeletonBox $width="100%" $height="200px" />
        </SkeletonSection>
        <SkeletonSection>
          <SkeletonBox $width="100%" $height="180px" />
        </SkeletonSection>
      </ContentWrapper>
    </Container>
  );
}

const Container = tw.div`
  min-h-screen
  bg-bg-layer-base
  max-w-[600px]
  mx-auto
`;

const Header = tw.header`
  h-16
  px-5
  py-5
  bg-white
  border-b
  border-[var(--stroke-neutral)]
  flex
  items-center
  gap-5
`;

const BackButton = tw.button`
  w-6
  h-6
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const HeaderTitle = tw.h1`
  flex-1
  text-center
  text-fg-neutral
  text-lg
  font-bold
  leading-6
`;

const HeaderSpacer = tw.div`
  w-6
  h-6
`;

const ContentWrapper = tw.div`
  flex
  flex-col
  gap-2
`;

const SkeletonSection = tw.div`
  p-5
  bg-white
`;

const SkeletonBox = tw.div<{ $width: string; $height: string }>`
  bg-gray-200
  rounded-xl
  animate-pulse
  ${({ $width }) => `width: ${$width};`}
  ${({ $height }) => `height: ${$height};`}
`;
