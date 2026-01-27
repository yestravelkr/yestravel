/**
 * BrandCreatePage - 브랜드 생성 페이지
 *
 * Figma 디자인 기반 브랜드 등록 폼
 * 기본정보, 사업자정보, 정산정보 섹션으로 구성
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { ImageFileField } from '@/shared/components/brand/LicenseFileField';
import { Card } from '@/shared/components/card/Card';
import { FormPageLayout, PrimaryButton } from '@/shared/components/layout';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { trpc } from '@/shared/trpc';
import {
  registerBrandInputSchema,
  BusinessType,
  type RegisterBrandInput,
} from '@/types/brand.type';

export const Route = createFileRoute('/_auth/brand/create')({
  component: BrandCreatePage,
});

function BrandCreatePage() {
  const navigate = useNavigate();
  const registerMutation = trpc.backofficeBrand.register.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterBrandInput>({
    resolver: zodResolver(registerBrandInputSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      businessInfo: {
        type: undefined,
        name: '',
        licenseNumber: '',
        ceoName: '',
        licenseFileUrl: '',
      },
      bankInfo: {
        name: '',
        accountNumber: '',
        accountHolder: '',
      },
    },
  });

  const licenseFileUrl = watch('businessInfo.licenseFileUrl');

  const businessTypeValue = watch('businessInfo.type');

  const businessTypeOptions = [
    { value: BusinessType.INDIVIDUAL, label: '개인사업자' },
    { value: BusinessType.SOLE_PROPRIETOR, label: '간이사업자' },
    { value: BusinessType.CORPORATION, label: '법인사업자' },
  ];

  const onSubmit = async (data: RegisterBrandInput) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('브랜드가 성공적으로 등록되었습니다.');
      navigate({ to: '/brand' });
    } catch (err) {
      console.error('브랜드 등록 실패:', err);
      toast.error('브랜드 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBack = () => {
    navigate({ to: '/brand' });
  };

  return (
    <FormPageLayout.Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormPageLayout.Content>
          <FormPageLayout.Header title="새 브랜드" onBack={handleBack}>
            <PrimaryButton type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? '저장 중...' : '저장'}
            </PrimaryButton>
          </FormPageLayout.Header>

          <FormPageLayout.Cards>
            {/* 기본정보 */}
            <Card title="기본정보">
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>브랜드명</FieldLabel>
                  <StyledInput
                    {...register('name')}
                    placeholder="브랜드명을 입력하세요"
                    $error={!!errors.name}
                  />
                  {errors.name && (
                    <ErrorMessage>{errors.name.message}</ErrorMessage>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>이메일</FieldLabel>
                  <StyledInput
                    {...register('email')}
                    type="email"
                    placeholder="contact@brand.com"
                    $error={!!errors.email}
                  />
                  {errors.email && (
                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>연락처</FieldLabel>
                  <StyledInput
                    {...register('phoneNumber')}
                    placeholder="010-0000-0000"
                    $error={!!errors.phoneNumber}
                  />
                  {errors.phoneNumber && (
                    <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper />
              </FormRow>
            </Card>

            {/* 사업자정보 */}
            <Card title="사업자정보">
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>사업자 유형</FieldLabel>
                  <SelectDropdown
                    variant="form"
                    options={businessTypeOptions}
                    value={businessTypeValue}
                    onChange={(v) =>
                      setValue('businessInfo.type', v as BusinessType)
                    }
                    error={!!errors.businessInfo?.type}
                    placeholder="선택해주세요"
                  />
                  {errors.businessInfo?.type && (
                    <ErrorMessage>
                      {
                        (errors.businessInfo.type as { message?: string })
                          ?.message
                      }
                    </ErrorMessage>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>사업자명</FieldLabel>
                  <StyledInput
                    {...register('businessInfo.name')}
                    placeholder="사업자명을 입력하세요"
                    $error={!!errors.businessInfo?.name}
                  />
                  {errors.businessInfo?.name && (
                    <ErrorMessage>
                      {errors.businessInfo.name.message}
                    </ErrorMessage>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>사업자등록번호</FieldLabel>
                  <StyledInput
                    {...register('businessInfo.licenseNumber')}
                    placeholder="123-12-12345"
                    $error={!!errors.businessInfo?.licenseNumber}
                  />
                  {errors.businessInfo?.licenseNumber && (
                    <ErrorMessage>
                      {errors.businessInfo.licenseNumber.message}
                    </ErrorMessage>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>대표자명</FieldLabel>
                  <StyledInput
                    {...register('businessInfo.ceoName')}
                    placeholder="대표자명을 입력하세요"
                    $error={!!errors.businessInfo?.ceoName}
                  />
                  {errors.businessInfo?.ceoName && (
                    <ErrorMessage>
                      {errors.businessInfo.ceoName.message}
                    </ErrorMessage>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormFieldWrapperFull>
                <ImageFileField
                  label="사업자등록증 사본"
                  isEditMode={true}
                  fileUrl={licenseFileUrl}
                  error={errors.businessInfo?.licenseFileUrl?.message}
                  onChange={(url) =>
                    setValue('businessInfo.licenseFileUrl', url)
                  }
                  uploadPath="business-license"
                />
              </FormFieldWrapperFull>
            </Card>

            {/* 정산정보 */}
            <Card title="정산정보">
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>은행</FieldLabel>
                  <StyledInput
                    {...register('bankInfo.name')}
                    placeholder="은행명을 입력하세요"
                    $error={!!errors.bankInfo?.name}
                  />
                  {errors.bankInfo?.name && (
                    <ErrorMessage>{errors.bankInfo.name.message}</ErrorMessage>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>예금주</FieldLabel>
                  <StyledInput
                    {...register('bankInfo.accountHolder')}
                    placeholder="예금주명을 입력하세요"
                    $error={!!errors.bankInfo?.accountHolder}
                  />
                  {errors.bankInfo?.accountHolder && (
                    <ErrorMessage>
                      {errors.bankInfo.accountHolder.message}
                    </ErrorMessage>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormFieldWrapperFull>
                <FieldLabel>계좌번호</FieldLabel>
                <StyledInput
                  {...register('bankInfo.accountNumber')}
                  placeholder="계좌번호를 입력하세요"
                  $error={!!errors.bankInfo?.accountNumber}
                />
                {errors.bankInfo?.accountNumber && (
                  <ErrorMessage>
                    {errors.bankInfo.accountNumber.message}
                  </ErrorMessage>
                )}
              </FormFieldWrapperFull>
            </Card>
          </FormPageLayout.Cards>
        </FormPageLayout.Content>
      </form>
    </FormPageLayout.Container>
  );
}

// ============================================
// Form Styled Components
// ============================================

const FormRow = tw.div`
  flex gap-2
  w-full
`;

const FormFieldWrapper = tw.div`
  flex flex-col
  gap-2
  flex-1
  min-w-0
`;

const FormFieldWrapperFull = tw.div`
  flex flex-col
  gap-2
  w-full
`;

const FieldLabel = tw.label`
  text-[15px]
  leading-5
  text-[var(--fg-muted,#71717A)]
`;

const StyledInput = tw.input<{ $error?: boolean }>`
  w-full
  h-11
  px-4
  bg-white
  border
  rounded-xl
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
  placeholder:text-[var(--fg-placeholder,#9E9E9E)]
  outline-none
  transition-colors
  focus:ring-2 focus:ring-blue-500
  ${({ $error }) =>
    $error
      ? 'border-[var(--stroke-critical,#EB3D3D)]'
      : 'border-[var(--stroke-neutral,#E4E4E7)]'}
`;

const ErrorMessage = tw.p`
  text-sm
  text-[var(--fg-critical,#EB3D3D)]
`;
