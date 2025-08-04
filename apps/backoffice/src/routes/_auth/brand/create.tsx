import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type RegisterBrandInput } from '@yestravelkr/yestravel-schema';
import tw from 'tailwind-styled-components';

import { BrandForm } from '@/shared/components';
import { Toast, ToastsContainer } from '@/shared/components/toast/Toast';
import { useToast } from '@/shared/hooks';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/brand/create')({
  component: BrandCreatePage,
});

function BrandCreatePage() {
  const navigate = useNavigate();
  const registerMutation = trpc.backofficeBrand.register.useMutation();
  const { toasts, removeToast, success, error } = useToast();

  const handleSubmit = async (data: RegisterBrandInput) => {
    try {
      await registerMutation.mutateAsync(data);
      success('브랜드가 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate({ to: '/brand' });
      }, 1000);
    } catch (err) {
      console.error('브랜드 등록 실패:', err);
      error('브랜드 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <Container>
        <Header>
          <BackButton to="/brand">← 목록으로</BackButton>
          <Title>새 브랜드 등록</Title>
        </Header>

        <BrandForm
          isEditMode={true}
          onSubmit={handleSubmit}
          isSubmitting={registerMutation.isPending}
          submitButtonText="등록하기"
          showCancelButton={true}
          onCancel={() => navigate({ to: '/brand' })}
        />
      </Container>

      {/* Toast notifications */}
      <ToastsContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastsContainer>
    </>
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
