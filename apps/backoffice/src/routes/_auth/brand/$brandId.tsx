import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { BrandForm } from '@/shared/components';
import { Toast, ToastsContainer } from '@/shared/components/toast/Toast';
import { useToast } from '@/shared/hooks';
import { trpc } from '@/shared/trpc';
import type { RegisterBrandInput } from '@/types/brand.type';

export const Route = createFileRoute('/_auth/brand/$brandId')({
  component: BrandDetailPage,
});

function BrandDetailPage() {
  const { brandId } = Route.useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  // API 호출
  const {
    data: brand,
    isLoading,
    isError,
  } = trpc.backofficeBrand.findById.useQuery({
    id: parseInt(brandId),
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.backofficeBrand.update.useMutation({
    onSuccess: () => {
      // 데이터 재조회
      utils.backofficeBrand.findById.invalidate({ id: parseInt(brandId) });
    },
  });

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSubmit = async (data: RegisterBrandInput) => {
    try {
      await updateMutation.mutateAsync({
        id: parseInt(brandId),
        ...data,
      });

      success('브랜드 정보가 성공적으로 수정되었습니다.');
      setIsEditMode(false);
    } catch (err) {
      console.error('브랜드 수정 실패:', err);
      error('브랜드 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingText>브랜드 정보를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (isError || !brand) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>브랜드를 찾을 수 없습니다.</ErrorText>
          <BackButton to="/brand">목록으로 돌아가기</BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <BackButton to="/brand">← 목록으로</BackButton>

        <BrandForm
          data={brand}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitButtonText="저장"
          showCancelButton={true}
          onCancel={handleCancelEdit}
          onEdit={handleEditClick}
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

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  h-64
`;

const LoadingText = tw.p`
  text-gray-500
`;

const ErrorContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  h-64
  space-y-4
`;

const ErrorText = tw.p`
  text-red-600
  text-lg
`;

const BackButton = tw(Link)`
  text-gray-600
  hover:text-gray-900
  text-sm
  mb-6
  inline-block
`;
