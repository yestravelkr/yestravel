import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormData>({
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

  const createMutation = trpc.backofficeCampaign.create.useMutation({
    onSuccess: () => {
      toast.success('캠페인이 등록되었습니다.');
      navigate({ to: '/campaign' });
    },
    onError: (error) => {
      toast.error(error.message || '캠페인 등록에 실패했습니다.');
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    // TODO: API 연동
    console.log('Form data:', data);
    toast.info('API 연동 예정');
  };

  return (
    <MajorPageLayout
      title="캠페인 등록"
      description="새로운 캠페인을 등록합니다"
      headerActions={
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? '등록 중...' : '등록'}
        </Button>
      }
    >
      <FormContainer>
        <CampaignBasicInfoSection control={control} />
        <CampaignProductSection control={control} />
        <CampaignInfluencerSection control={control} />
      </FormContainer>
    </MajorPageLayout>
  );
}

const FormContainer = tw.div`
  max-w-4xl
  mx-auto
  flex
  flex-col
  gap-6
`;
