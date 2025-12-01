import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { InfluencerForm } from './_components/InfluencerForm';

import { trpc } from '@/shared/trpc';
import type { RouterInputs } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/influencer/create')({
  component: InfluencerCreatePage,
});

type CreateInfluencerInput = RouterInputs['backofficeInfluencer']['create'];

function InfluencerCreatePage() {
  const navigate = useNavigate();
  const registerMutation = trpc.backofficeInfluencer.create.useMutation();

  const handleSubmit = async (data: CreateInfluencerInput) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('인플루언서가 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate({ to: '/influencer' });
      }, 1000);
    } catch (err: any) {
      console.error('인플루언서 등록 실패:', err);

      // API 에러 메시지 추출
      const errorMessage =
        err?.message || '인플루언서 등록에 실패했습니다. 다시 시도해주세요.';
      toast.error(errorMessage);

      // 에러를 다시 throw하여 form에서 catch할 수 있게 함
      throw err;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton to="/influencer">← 목록으로</BackButton>
        <Title>새 인플루언서 등록</Title>
      </Header>

      <InfluencerForm
        isEditMode={true}
        onSubmit={handleSubmit}
        isSubmitting={registerMutation.isPending}
        submitButtonText="등록하기"
        showCancelButton={true}
        onCancel={() => navigate({ to: '/influencer' })}
      />
    </Container>
  );
}

const Container = tw.div`
  p-6
`;

const Header = tw.div`
  mb-6
`;

const BackButton = tw(Link)`
  text-gray-600
  hover:text-gray-900
  text-sm
  mb-2
  inline-block
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
`;
