import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { InfluencerForm } from './_components/InfluencerForm';

import { ManagerSection, useManagerSection } from '@/shared/components/manager';
import { trpc, type RouterInputs } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/influencer/$influencerId')({
  component: InfluencerDetailPage,
});

type UpdateInfluencerInput = RouterInputs['backofficeInfluencer']['update'];

function InfluencerDetailPage() {
  return (
    <Container>
      <Suspense
        fallback={
          <LoadingContainer>
            <LoadingText>인플루언서 정보를 불러오는 중...</LoadingText>
          </LoadingContainer>
        }
      >
        <InfluencerDetailContent />
      </Suspense>
    </Container>
  );
}

function InfluencerDetailContent() {
  const { influencerId } = Route.useParams();
  const [isEditMode, setIsEditMode] = useState(false);

  // API 호출 - useSuspenseQuery로 변경
  const [influencer] = trpc.backofficeInfluencer.findById.useSuspenseQuery({
    id: parseInt(influencerId),
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.backofficeInfluencer.update.useMutation({
    onSuccess: () => {
      // 데이터 재조회
      utils.backofficeInfluencer.findById.invalidate({
        id: parseInt(influencerId),
      });
    },
  });

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSubmit = async (
    data: Omit<UpdateInfluencerInput, 'id'>,
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({
        id: parseInt(influencerId),
        ...data,
      });

      toast.success('인플루언서 정보가 성공적으로 수정되었습니다.');
      setIsEditMode(false);
    } catch (err) {
      console.error('인플루언서 수정 실패:', err);
      toast.error('인플루언서 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const managerProps = useManagerSection({
    partnerType: 'influencer',
    partnerId: parseInt(influencerId),
  });

  return (
    <>
      <BackButton to="/influencer">← 목록으로</BackButton>

      <InfluencerForm
        data={influencer}
        isEditMode={isEditMode}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitButtonText="저장"
        showCancelButton={true}
        onCancel={handleCancelEdit}
        onEdit={handleEditClick}
      />

      <ManagerSection {...managerProps} />
    </>
  );
}

const Container = tw.div`
  p-6
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  h-64
`;

const LoadingText = tw.p`
  text-gray-500
`;

const BackButton = tw(Link)`
  text-gray-600
  hover:text-gray-900
  text-sm
  mb-6
  inline-block
`;
