import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { CampaignBasicInfoSection } from './_components/CampaignBasicInfoSection';
import { CampaignInfluencerSection } from './_components/CampaignInfluencerSection';
import { CampaignProductSection } from './_components/CampaignProductSection';
import type { CampaignFormData } from './_components/types';

import { MajorPageLayout } from '@/components/layout/MajorPageLayout';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/campaign/create')({
  component: CampaignCreatePage,
});

function CampaignCreatePage() {
  const navigate = useNavigate();

  const methods = useForm<CampaignFormData>({
    defaultValues: {
      title: '',
      dateRange: {
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      },
      products: [],
      influencers: [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createMutation = trpc.backofficeCampaign.create.useMutation({
    onSuccess: () => {
      toast.success('캠페인이 등록되었습니다.');
      navigate({ to: '/campaign' });
    },
    onError: (error) => {
      toast.error(error.message || '캠페인 등록에 실패했습니다.');
    },
  });

  const handleCancel = () => {
    navigate({ to: '/campaign' });
  };

  const onSubmit = (data: CampaignFormData) => {
    // Form 데이터를 API 입력 형식으로 변환
    const apiInput = {
      title: data.title,
      startAt: new Date(data.dateRange.startDate),
      endAt: new Date(data.dateRange.endDate),
      // products: id -> productId, status 변환 (ACTIVE -> VISIBLE, INACTIVE -> HIDDEN)
      products: data.products.map((product) => ({
        productId: product.id,
        status: product.status === 'ACTIVE' ? 'VISIBLE' : 'HIDDEN',
      })),
      // influencers: string date -> Date 변환
      influencers: data.influencers.map((influencer) => ({
        influencerId: influencer.influencerId,
        periodType: influencer.periodType,
        startAt: influencer.startAt ? new Date(influencer.startAt) : null,
        endAt: influencer.endAt ? new Date(influencer.endAt) : null,
        feeType: influencer.feeType,
        fee: influencer.fee,
        status: influencer.status,
        products: influencer.products.map((product) => ({
          productId: product.productId,
          useCustomCommission: product.useCustomCommission,
          hotelOptions: product.hotelOptions,
        })),
      })),
    };

    createMutation.mutate(
      apiInput as Parameters<typeof createMutation.mutate>[0],
    );
  };

  return (
    <FormProvider {...methods}>
      <MajorPageLayout
        title="캠페인 등록"
        description="새로운 캠페인을 등록합니다"
        headerActions={<CancelLink to="/campaign">취소</CancelLink>}
      >
        <FormContainer>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContent>
              <CampaignBasicInfoSection />
              <CampaignProductSection />
              <CampaignInfluencerSection />
            </FormContent>

            <FormActions>
              <SecondaryButton type="button" onClick={handleCancel}>
                취소
              </SecondaryButton>
              <Button
                type="submit"
                kind="primary"
                variant="solid"
                size="large"
                disabled={createMutation.isPending || isSubmitting}
              >
                {createMutation.isPending || isSubmitting
                  ? '등록 중...'
                  : '캠페인 등록'}
              </Button>
            </FormActions>
          </Form>
        </FormContainer>
      </MajorPageLayout>
    </FormProvider>
  );
}

const FormContainer = tw.div`
  w-full
  mx-auto
`;

const Form = tw.form`
  space-y-6
`;

const FormContent = tw.div`
  max-w-4xl
  mx-auto
  flex
  flex-col
  gap-6
  pb-24
`;

const FormActions = tw.div`
  fixed
  bottom-0
  left-0
  right-0
  flex
  justify-end
  space-x-3
  p-6
  border-t
  border-gray-200
  bg-white
`;

const CancelLink = tw(Link)`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

const SecondaryButton = tw.button`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;
