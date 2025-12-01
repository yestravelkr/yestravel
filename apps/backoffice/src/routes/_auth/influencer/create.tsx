import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { InfluencerForm } from './_components/InfluencerForm';

export const Route = createFileRoute('/_auth/influencer/create')({
  component: InfluencerCreatePage,
});

interface CreateInfluencerInput {
  name: string;
  email?: string;
  phoneNumber?: string;
  thumbnail?: string;
  businessInfo?: {
    type?: 'INDIVIDUAL' | 'SOLE_PROPRIETOR' | 'CORPORATION';
    name?: string;
    licenseNumber?: string;
    ceoName?: string;
    licenseFileUrl?: string;
  };
  bankInfo?: {
    name?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  socialMedias: Array<{
    platform:
      | 'INSTAGRAM'
      | 'FACEBOOK'
      | 'TWITTER'
      | 'YOUTUBE'
      | 'TIKTOK'
      | 'WEBSITE';
    url: string;
  }>;
}

function InfluencerCreatePage() {
  const navigate = useNavigate();
  // TODO: API 연동
  // const registerMutation = trpc.backofficeInfluencer.create.useMutation();

  const handleSubmit = async (data: CreateInfluencerInput) => {
    try {
      // TODO: API 연동 후 주석 해제
      // await registerMutation.mutateAsync(data);
      console.log('인플루언서 등록 데이터:', data);
      toast.success('인플루언서가 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate({ to: '/influencer' });
      }, 1000);
    } catch (err) {
      console.error('인플루언서 등록 실패:', err);
      toast.error('인플루언서 등록에 실패했습니다. 다시 시도해주세요.');
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
        isSubmitting={false}
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
