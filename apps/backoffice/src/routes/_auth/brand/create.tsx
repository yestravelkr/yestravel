import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  registerBrandInputSchema,
  BusinessType,
  type RegisterBrandInput,
} from '@yestravelkr/api-types';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { FormField, Input, Select } from '@/shared/components';
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterBrandInput>({
    resolver: zodResolver(registerBrandInputSchema),
  });

  const businessTypeOptions = [
    { value: BusinessType.INDIVIDUAL, label: '개인 사업자' },
    { value: BusinessType.SOLE_PROPRIETOR, label: '간이 사업자' },
    { value: BusinessType.CORPORATION, label: '법인 사업자' },
  ];

  const onSubmit = async (data: RegisterBrandInput) => {
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

        <FormContainer>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormContent>
              <Section>
                <SectionTitle>기본 정보</SectionTitle>
                <FormGrid>
                  <FormField
                    label="브랜드명"
                    error={errors.name?.message}
                    required
                  >
                    <Input
                      {...register('name')}
                      placeholder="브랜드명을 입력하세요"
                      error={!!errors.name}
                    />
                  </FormField>

                  <FormField label="이메일" error={errors.email?.message}>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="contact@brand.com"
                      error={!!errors.email}
                    />
                  </FormField>

                  <FormField label="연락처" error={errors.phoneNumber?.message}>
                    <Input
                      {...register('phoneNumber')}
                      placeholder="010-1234-5678"
                      error={!!errors.phoneNumber}
                    />
                  </FormField>
                </FormGrid>
              </Section>

              <Section>
                <SectionTitle>사업자 정보</SectionTitle>
                <FormGrid>
                  <FormField
                    label="사업자 유형"
                    error={errors.businessInfo?.type?.message}
                  >
                    <Select
                      {...register('businessInfo.type')}
                      options={businessTypeOptions}
                      placeholder="사업자 유형을 선택하세요"
                      error={!!errors.businessInfo?.type}
                    />
                  </FormField>

                  <FormField
                    label="사업자명"
                    error={errors.businessInfo?.name?.message}
                  >
                    <Input
                      {...register('businessInfo.name')}
                      placeholder="사업자명을 입력하세요"
                      error={!!errors.businessInfo?.name}
                    />
                  </FormField>

                  <FormField
                    label="사업자등록번호"
                    error={errors.businessInfo?.licenseNumber?.message}
                  >
                    <Input
                      {...register('businessInfo.licenseNumber')}
                      placeholder="000-00-00000"
                      error={!!errors.businessInfo?.licenseNumber}
                    />
                  </FormField>

                  <FormField
                    label="대표자명"
                    error={errors.businessInfo?.ceoName?.message}
                  >
                    <Input
                      {...register('businessInfo.ceoName')}
                      placeholder="대표자명을 입력하세요"
                      error={!!errors.businessInfo?.ceoName}
                    />
                  </FormField>
                </FormGrid>
              </Section>

              <Section>
                <SectionTitle>계좌 정보</SectionTitle>
                <FormGrid>
                  <FormField
                    label="은행명"
                    error={errors.bankInfo?.name?.message}
                  >
                    <Input
                      {...register('bankInfo.name')}
                      placeholder="은행명을 입력하세요"
                      error={!!errors.bankInfo?.name}
                    />
                  </FormField>

                  <FormField
                    label="계좌번호"
                    error={errors.bankInfo?.accountNumber?.message}
                  >
                    <Input
                      {...register('bankInfo.accountNumber')}
                      placeholder="계좌번호를 입력하세요"
                      error={!!errors.bankInfo?.accountNumber}
                    />
                  </FormField>

                  <FormField
                    label="예금주"
                    error={errors.bankInfo?.accountHolder?.message}
                  >
                    <Input
                      {...register('bankInfo.accountHolder')}
                      placeholder="예금주명을 입력하세요"
                      error={!!errors.bankInfo?.accountHolder}
                    />
                  </FormField>
                </FormGrid>
              </Section>
            </FormContent>

            <ButtonGroup>
              <CancelButton to="/brand" type="button">
                취소
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting || registerMutation.isPending}
              >
                {isSubmitting || registerMutation.isPending
                  ? '등록 중...'
                  : '등록하기'}
              </SubmitButton>
            </ButtonGroup>
          </form>
        </FormContainer>
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

const FormContainer = tw.div`
  bg-white 
  rounded-lg 
  shadow-sm 
  border 
  border-gray-200
`;

const FormContent = tw.div`
  p-6 
  space-y-8
`;

const Section = tw.div`
  space-y-4
`;

const SectionTitle = tw.h2`
  text-lg 
  font-semibold 
  text-gray-900 
  border-b 
  border-gray-200 
  pb-2
`;

const FormGrid = tw.div`
  grid 
  grid-cols-1 
  md:grid-cols-2 
  gap-4
`;

const ButtonGroup = tw.div`
  flex 
  gap-3 
  justify-end 
  px-6 
  py-4 
  border-t 
  border-gray-200 
  bg-gray-50 
  rounded-b-lg
`;

const CancelButton = tw(Link)`
  px-4 
  py-2 
  border 
  border-gray-300 
  text-gray-700 
  rounded-lg 
  hover:bg-gray-50 
  transition-colors
  font-medium
`;

const SubmitButton = tw.button`
  px-6 
  py-2 
  bg-blue-600 
  text-white 
  rounded-lg 
  hover:bg-blue-700 
  disabled:opacity-50 
  disabled:cursor-not-allowed 
  transition-colors
  font-medium
`;
