/**
 * BrandDetailPage - 브랜드 상세/수정 페이지
 *
 * Figma 디자인 기반 브랜드 상세 조회 및 수정 폼
 * 기본정보, 사업자정보, 정산정보 섹션으로 구성
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { LicenseFileField } from '@/shared/components/brand/LicenseFileField';
import { Card } from '@/shared/components/card/Card';
import {
  FormPageLayout,
  PrimaryButton,
  SecondaryButton,
  ButtonGroup,
} from '@/shared/components/layout';
import { ManagerSection, useManagerSection } from '@/shared/components/manager';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { trpc } from '@/shared/trpc';
import {
  registerBrandInputSchema,
  BusinessType,
  type RegisterBrandInput,
} from '@/types/brand.type';

export const Route = createFileRoute('/_auth/brand/$brandId')({
  component: BrandDetailPage,
});

function BrandDetailPage() {
  const { brandId } = Route.useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

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
      utils.backofficeBrand.findById.invalidate({ id: parseInt(brandId) });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RegisterBrandInput>({
    resolver: zodResolver(registerBrandInputSchema),
  });

  // 브랜드 데이터가 로드되면 폼 값 설정
  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name,
        email: brand.email || '',
        phoneNumber: brand.phoneNumber || '',
        businessInfo: {
          type: brand.businessInfo?.type || undefined,
          name: brand.businessInfo?.name || '',
          licenseNumber: brand.businessInfo?.licenseNumber || '',
          ceoName: brand.businessInfo?.ceoName || '',
          licenseFileUrl: brand.businessInfo?.licenseFileUrl || '',
        },
        bankInfo: {
          name: brand.bankInfo?.name || '',
          accountNumber: brand.bankInfo?.accountNumber || '',
          accountHolder: brand.bankInfo?.accountHolder || '',
        },
      });
    }
  }, [brand, reset]);

  const licenseFileUrl = watch('businessInfo.licenseFileUrl');
  const businessTypeValue = watch('businessInfo.type');

  const businessTypeOptions = [
    { value: BusinessType.INDIVIDUAL, label: '개인사업자' },
    { value: BusinessType.SOLE_PROPRIETOR, label: '간이사업자' },
    { value: BusinessType.CORPORATION, label: '법인사업자' },
  ];

  const onSubmit = async (data: RegisterBrandInput) => {
    try {
      await updateMutation.mutateAsync({
        id: parseInt(brandId),
        ...data,
      });
      toast.success('브랜드 정보가 성공적으로 수정되었습니다.');
      setIsEditMode(false);
    } catch (err) {
      console.error('브랜드 수정 실패:', err);
      toast.error('브랜드 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBack = () => {
    navigate({ to: '/brand' });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (brand) {
      reset({
        name: brand.name,
        email: brand.email || '',
        phoneNumber: brand.phoneNumber || '',
        businessInfo: {
          type: brand.businessInfo?.type || undefined,
          name: brand.businessInfo?.name || '',
          licenseNumber: brand.businessInfo?.licenseNumber || '',
          ceoName: brand.businessInfo?.ceoName || '',
          licenseFileUrl: brand.businessInfo?.licenseFileUrl || '',
        },
        bankInfo: {
          name: brand.bankInfo?.name || '',
          accountNumber: brand.bankInfo?.accountNumber || '',
          accountHolder: brand.bankInfo?.accountHolder || '',
        },
      });
    }
    setIsEditMode(false);
  };

  const managerProps = useManagerSection({
    partnerType: 'brand',
    partnerId: parseInt(brandId),
  });

  if (isLoading) {
    return (
      <FormPageLayout.Container>
        <LoadingMessage>브랜드 정보를 불러오는 중...</LoadingMessage>
      </FormPageLayout.Container>
    );
  }

  if (isError || !brand) {
    return (
      <FormPageLayout.Container>
        <ErrorStateMessage>브랜드를 찾을 수 없습니다.</ErrorStateMessage>
      </FormPageLayout.Container>
    );
  }

  return (
    <FormPageLayout.Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormPageLayout.Content>
          <FormPageLayout.Header title={brand.name} onBack={handleBack}>
            {isEditMode ? (
              <ButtonGroup>
                <SecondaryButton type="button" onClick={handleCancel}>
                  취소
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </PrimaryButton>
              </ButtonGroup>
            ) : (
              <PrimaryButton type="button" onClick={handleEdit}>
                수정
              </PrimaryButton>
            )}
          </FormPageLayout.Header>

          <FormPageLayout.Cards>
            {/* 기본정보 */}
            <Card title="기본정보">
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>브랜드명</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('name')}
                        placeholder="브랜드명을 입력하세요"
                        $error={!!errors.name}
                      />
                      {errors.name && (
                        <FieldErrorMessage>
                          {errors.name.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>{brand.name}</FieldValue>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>이메일</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('email')}
                        type="email"
                        placeholder="contact@brand.com"
                        $error={!!errors.email}
                      />
                      {errors.email && (
                        <FieldErrorMessage>
                          {errors.email.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>{brand.email || '-'}</FieldValue>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>연락처</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('phoneNumber')}
                        placeholder="010-0000-0000"
                        $error={!!errors.phoneNumber}
                      />
                      {errors.phoneNumber && (
                        <FieldErrorMessage>
                          {errors.phoneNumber.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>{brand.phoneNumber || '-'}</FieldValue>
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
                  {isEditMode ? (
                    <>
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
                        <FieldErrorMessage>
                          {
                            (errors.businessInfo.type as { message?: string })
                              ?.message
                          }
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>
                      {businessTypeOptions.find(
                        (opt) => opt.value === brand.businessInfo?.type,
                      )?.label || '-'}
                    </FieldValue>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>사업자명</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('businessInfo.name')}
                        placeholder="사업자명을 입력하세요"
                        $error={!!errors.businessInfo?.name}
                      />
                      {errors.businessInfo?.name && (
                        <FieldErrorMessage>
                          {errors.businessInfo.name.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>{brand.businessInfo?.name || '-'}</FieldValue>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormRow>
                <FormFieldWrapper>
                  <FieldLabel>사업자등록번호</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('businessInfo.licenseNumber')}
                        placeholder="123-12-12345"
                        $error={!!errors.businessInfo?.licenseNumber}
                      />
                      {errors.businessInfo?.licenseNumber && (
                        <FieldErrorMessage>
                          {errors.businessInfo.licenseNumber.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>
                      {brand.businessInfo?.licenseNumber || '-'}
                    </FieldValue>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>대표자명</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('businessInfo.ceoName')}
                        placeholder="대표자명을 입력하세요"
                        $error={!!errors.businessInfo?.ceoName}
                      />
                      {errors.businessInfo?.ceoName && (
                        <FieldErrorMessage>
                          {errors.businessInfo.ceoName.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>
                      {brand.businessInfo?.ceoName || '-'}
                    </FieldValue>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormFieldWrapperFull>
                <LicenseFileField
                  label="사업자등록증 사본"
                  isEditMode={isEditMode}
                  fileUrl={
                    isEditMode
                      ? licenseFileUrl
                      : brand.businessInfo?.licenseFileUrl
                  }
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
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('bankInfo.name')}
                        placeholder="은행명을 입력하세요"
                        $error={!!errors.bankInfo?.name}
                      />
                      {errors.bankInfo?.name && (
                        <FieldErrorMessage>
                          {errors.bankInfo.name.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>{brand.bankInfo?.name || '-'}</FieldValue>
                  )}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <FieldLabel>예금주</FieldLabel>
                  {isEditMode ? (
                    <>
                      <StyledInput
                        {...register('bankInfo.accountHolder')}
                        placeholder="예금주명을 입력하세요"
                        $error={!!errors.bankInfo?.accountHolder}
                      />
                      {errors.bankInfo?.accountHolder && (
                        <FieldErrorMessage>
                          {errors.bankInfo.accountHolder.message}
                        </FieldErrorMessage>
                      )}
                    </>
                  ) : (
                    <FieldValue>
                      {brand.bankInfo?.accountHolder || '-'}
                    </FieldValue>
                  )}
                </FormFieldWrapper>
              </FormRow>
              <FormFieldWrapperFull>
                <FieldLabel>계좌번호</FieldLabel>
                {isEditMode ? (
                  <>
                    <StyledInput
                      {...register('bankInfo.accountNumber')}
                      placeholder="계좌번호를 입력하세요"
                      $error={!!errors.bankInfo?.accountNumber}
                    />
                    {errors.bankInfo?.accountNumber && (
                      <FieldErrorMessage>
                        {errors.bankInfo.accountNumber.message}
                      </FieldErrorMessage>
                    )}
                  </>
                ) : (
                  <FieldValue>
                    {brand.bankInfo?.accountNumber || '-'}
                  </FieldValue>
                )}
              </FormFieldWrapperFull>
            </Card>

            {/* 사용자 */}
            <ManagerSection {...managerProps} />
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

const FieldValue = tw.div`
  h-11
  flex items-center
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
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

const FieldErrorMessage = tw.p`
  text-sm
  text-[var(--fg-critical,#EB3D3D)]
`;

const LoadingMessage = tw.div`
  text-[var(--fg-muted)]
  text-lg
`;

const ErrorStateMessage = tw.div`
  text-[var(--fg-critical,#EB3D3D)]
  text-lg
`;
