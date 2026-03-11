/**
 * CampaignDetailPage - 캠페인 상세/수정 페이지
 *
 * 캠페인 상세 정보를 조회하고 수정할 수 있는 페이지입니다.
 * create.tsx와 동일한 섹션 컴포넌트를 재사용합니다.
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { Suspense, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { CampaignBasicInfoSection } from './_components/CampaignBasicInfoSection';
import { CampaignInfluencerSection } from './_components/CampaignInfluencerSection';
import { CampaignProductSection } from './_components/CampaignProductSection';
import type {
  CampaignFormData,
  CampaignInfluencerFormData,
  CampaignProductFormData,
} from './_components/types';

import { MajorPageLayout } from '@/components/layout/MajorPageLayout';
import { trpc, type RouterOutputs } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/campaign/$campaignId')({
  component: CampaignDetailPage,
});

type CampaignDetail = RouterOutputs['backofficeCampaign']['findById'];

function CampaignDetailPage() {
  return (
    <Container>
      <Suspense
        fallback={
          <LoadingContainer>
            <LoadingText>캠페인 정보를 불러오는 중...</LoadingText>
          </LoadingContainer>
        }
      >
        <CampaignDetailContent />
      </Suspense>
    </Container>
  );
}

/**
 * API 응답 데이터를 Form 데이터로 변환
 */
function convertApiToFormData(campaign: CampaignDetail): CampaignFormData {
  // 상품 변환: API status(VISIBLE/HIDDEN) -> Form status(ACTIVE/INACTIVE)
  const products: CampaignProductFormData[] = campaign.products.map(
    (product) => ({
      id: product.id,
      status: product.status === 'VISIBLE' ? 'ACTIVE' : 'INACTIVE',
    }),
  );

  // 인플루언서 변환
  const influencers: CampaignInfluencerFormData[] = campaign.influencers.map(
    (influencer) => ({
      influencerId: influencer.influencerId,
      periodType: influencer.periodType,
      startAt: influencer.startAt
        ? dayjs(influencer.startAt).format('YYYY-MM-DD')
        : null,
      endAt: influencer.endAt
        ? dayjs(influencer.endAt).format('YYYY-MM-DD')
        : null,
      feeType: influencer.feeType,
      fee: influencer.fee,
      status: influencer.status,
      products: influencer.products.map((product) => ({
        productId: product.productId,
        status: product.status,
        useCustomCommission: product.useCustomCommission,
        hotelOptions: product.hotelOptions.map((option) => ({
          hotelOptionId: option.hotelOptionId,
          commissionByDate: option.commissionByDate,
        })),
      })),
    }),
  );

  return {
    title: campaign.title,
    dateRange: {
      startDate: dayjs(campaign.startAt).format('YYYY-MM-DD'),
      endDate: dayjs(campaign.endAt).format('YYYY-MM-DD'),
    },
    products,
    influencers,
  };
}

function CampaignDetailContent() {
  const { campaignId } = Route.useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(true);

  // API 호출
  const [campaign] = trpc.backofficeCampaign.findById.useSuspenseQuery({
    id: parseInt(campaignId),
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.backofficeCampaign.update.useMutation({
    onSuccess: () => {
      toast.success('캠페인이 수정되었습니다.');
      setIsEditMode(false);
      // 데이터 재조회
      utils.backofficeCampaign.findById.invalidate({
        id: parseInt(campaignId),
      });
      utils.backofficeCampaign.findAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || '캠페인 수정에 실패했습니다.');
    },
  });

  const methods = useForm<CampaignFormData>({
    defaultValues: convertApiToFormData(campaign),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // 캠페인 데이터가 변경되면 form reset
  useEffect(() => {
    reset(convertApiToFormData(campaign));
  }, [campaign, reset]);

  const handleCancelEdit = () => {
    reset(convertApiToFormData(campaign));
    setIsEditMode(false);
  };

  const handleBackToList = () => {
    navigate({
      to: '/campaign',
      search: {
        page: 1,
        limit: 50,
        periodType: '',
        periodPreset: '',
        startDate: '',
        endDate: '',
        campaignId: '',
        influencerId: '',
        brandId: '',
        viewMode: 'campaign',
      },
    });
  };

  const onSubmit = (data: CampaignFormData) => {
    const apiInput = {
      id: parseInt(campaignId),
      title: data.title,
      startAt: new Date(data.dateRange.startDate),
      endAt: new Date(data.dateRange.endDate),
      products: data.products.map((product) => ({
        productId: product.id,
        status:
          product.status === 'ACTIVE'
            ? ('VISIBLE' as const)
            : ('HIDDEN' as const),
      })),
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
          status: product.status,
          useCustomCommission: product.useCustomCommission,
          hotelOptions: product.hotelOptions,
        })),
      })),
    };

    updateMutation.mutate(
      apiInput as Parameters<typeof updateMutation.mutate>[0],
    );
  };

  return (
    <FormProvider {...methods}>
      <MajorPageLayout
        title={isEditMode ? '캠페인 수정' : '캠페인 상세'}
        description={isEditMode ? '캠페인 정보를 수정합니다' : campaign.title}
        headerActions={
          <BackLink
            to="/campaign"
            search={
              {
                page: 1,
                limit: 50,
                periodType: '',
                periodPreset: '',
                startDate: '',
                endDate: '',
                campaignId: '',
                influencerId: '',
                brandId: '',
                viewMode: 'campaign',
              } as never
            }
          >
            목록으로
          </BackLink>
        }
      >
        <FormContainer>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContent $disabled={!isEditMode}>
              <CampaignBasicInfoSection />
              <CampaignProductSection />
              <CampaignInfluencerSection />
            </FormContent>

            {isEditMode && (
              <FormActions>
                <SecondaryButton type="button" onClick={handleCancelEdit}>
                  취소
                </SecondaryButton>
                <Button
                  type="submit"
                  kind="primary"
                  variant="solid"
                  size="large"
                  disabled={updateMutation.isPending || isSubmitting}
                >
                  {updateMutation.isPending || isSubmitting
                    ? '저장 중...'
                    : '저장'}
                </Button>
              </FormActions>
            )}
          </Form>
        </FormContainer>
      </MajorPageLayout>
    </FormProvider>
  );
}

const Container = tw.div`
  w-full
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  h-64
`;

const LoadingText = tw.p`
  text-[var(--fg-muted)]
`;

const BackLink = tw(Link)`
  px-4
  py-2
  text-[var(--fg-neutral)]
  bg-white
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  hover:bg-[var(--bg-subtle)]
  transition-colors
  font-medium
  text-sm
`;

const FormContainer = tw.div`
  w-full
  mx-auto
`;

const Form = tw.form`
  space-y-6
`;

const FormContent = tw.div<{ $disabled?: boolean }>`
  max-w-4xl
  mx-auto
  flex
  flex-col
  gap-6
  pb-24
  ${({ $disabled }) => $disabled && 'pointer-events-none opacity-70'}
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
  border-[var(--stroke-neutral)]
  bg-white
`;

const SecondaryButton = tw.button`
  px-4
  py-2
  text-[var(--fg-neutral)]
  bg-white
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  hover:bg-[var(--bg-subtle)]
  transition-colors
  font-medium
`;

/**
 * Usage:
 *
 * Route: /campaign/:campaignId
 * 캠페인 상세 조회 및 수정 페이지
 */
