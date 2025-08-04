import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerBrandInputSchema,
  BusinessType,
  type RegisterBrandInput,
  type Brand,
} from '@yestravelkr/api-types';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { FormField, Input, Select } from '@/shared/components';

// 필드별 조회/수정 전환 컴포넌트
interface FieldWrapperProps {
  label: string;
  value?: string | null;
  isEditMode: boolean;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

function FieldWrapper({
  label,
  value,
  isEditMode,
  children,
  required,
  error,
}: FieldWrapperProps) {
  if (isEditMode) {
    return (
      <FormField label={label} error={error} required={required}>
        {children}
      </FormField>
    );
  }

  return (
    <InfoItem>
      <InfoLabel>{label}</InfoLabel>
      <InfoValue>{value || '-'}</InfoValue>
    </InfoItem>
  );
}

interface BrandFormProps {
  data?: Brand;
  isEditMode?: boolean;
  onSubmit?: (data: RegisterBrandInput) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function BrandForm({
  data,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
  submitButtonText = '저장',
  showCancelButton = false,
  onCancel,
  onEdit,
}: BrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterBrandInput>({
    resolver: zodResolver(registerBrandInputSchema),
    defaultValues: data
      ? {
          name: data.name,
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          businessInfo: {
            type: data.businessInfo?.type,
            name: data.businessInfo?.name || '',
            licenseNumber: data.businessInfo?.licenseNumber || '',
            ceoName: data.businessInfo?.ceoName || '',
          },
          bankInfo: {
            name: data.bankInfo?.name || '',
            accountNumber: data.bankInfo?.accountNumber || '',
            accountHolder: data.bankInfo?.accountHolder || '',
          },
        }
      : undefined,
  });

  const businessTypeOptions = [
    { value: BusinessType.INDIVIDUAL, label: '개인 사업자' },
    { value: BusinessType.SOLE_PROPRIETOR, label: '간이 사업자' },
    { value: BusinessType.CORPORATION, label: '법인 사업자' },
  ];

  const handleFormSubmit = async (formData: RegisterBrandInput) => {
    if (!onSubmit) return;

    try {
      await onSubmit(formData);
      if (!data) {
        // 신규 등록인 경우에만 폼 리셋
        reset();
      }
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    reset();
  };

  return (
    <FormContainer>
      {/* 헤더 - 조회모드일 때 수정 버튼 표시 */}
      {!isEditMode && onEdit && (
        <Header>
          <HeaderContent>
            <Title>{data?.name}</Title>
            <EditButton type="button" onClick={onEdit}>
              수정
            </EditButton>
          </HeaderContent>
        </Header>
      )}

      <form onSubmit={isEditMode ? handleSubmit(handleFormSubmit) : undefined}>
        <FormContent>
          <Section>
            <SectionTitle>기본 정보</SectionTitle>
            <FormGrid>
              <FieldWrapper
                label="브랜드명"
                value={data?.name}
                isEditMode={isEditMode}
                error={errors.name?.message}
                required
              >
                <Input
                  {...register('name')}
                  placeholder="브랜드명을 입력하세요"
                  error={!!errors.name}
                />
              </FieldWrapper>

              <FieldWrapper
                label="이메일"
                value={data?.email}
                isEditMode={isEditMode}
                error={errors.email?.message}
              >
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="contact@brand.com"
                  error={!!errors.email}
                />
              </FieldWrapper>

              <FieldWrapper
                label="연락처"
                value={data?.phoneNumber}
                isEditMode={isEditMode}
                error={errors.phoneNumber?.message}
              >
                <Input
                  {...register('phoneNumber')}
                  placeholder="010-1234-5678"
                  error={!!errors.phoneNumber}
                />
              </FieldWrapper>

              {!isEditMode && (
                <FieldWrapper
                  label="등록일"
                  value={
                    data?.createdAt
                      ? new Date(data.createdAt).toLocaleDateString('ko-KR')
                      : undefined
                  }
                  isEditMode={false}
                >
                  <div />
                </FieldWrapper>
              )}
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>사업자 정보</SectionTitle>
            <FormGrid>
              <FieldWrapper
                label="사업자 유형"
                value={
                  businessTypeOptions.find(
                    (option) => option.value === data?.businessInfo?.type,
                  )?.label
                }
                isEditMode={isEditMode}
                error={errors.businessInfo?.type?.message}
              >
                <Select
                  {...register('businessInfo.type')}
                  options={businessTypeOptions}
                  placeholder="사업자 유형을 선택하세요"
                  error={!!errors.businessInfo?.type}
                />
              </FieldWrapper>

              <FieldWrapper
                label="사업자명"
                value={data?.businessInfo?.name}
                isEditMode={isEditMode}
                error={errors.businessInfo?.name?.message}
              >
                <Input
                  {...register('businessInfo.name')}
                  placeholder="사업자명을 입력하세요"
                  error={!!errors.businessInfo?.name}
                />
              </FieldWrapper>

              <FieldWrapper
                label="사업자등록번호"
                value={data?.businessInfo?.licenseNumber}
                isEditMode={isEditMode}
                error={errors.businessInfo?.licenseNumber?.message}
              >
                <Input
                  {...register('businessInfo.licenseNumber')}
                  placeholder="000-00-00000"
                  error={!!errors.businessInfo?.licenseNumber}
                />
              </FieldWrapper>

              <FieldWrapper
                label="대표자명"
                value={data?.businessInfo?.ceoName}
                isEditMode={isEditMode}
                error={errors.businessInfo?.ceoName?.message}
              >
                <Input
                  {...register('businessInfo.ceoName')}
                  placeholder="대표자명을 입력하세요"
                  error={!!errors.businessInfo?.ceoName}
                />
              </FieldWrapper>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>계좌 정보</SectionTitle>
            <FormGrid>
              <FieldWrapper
                label="은행명"
                value={data?.bankInfo?.name}
                isEditMode={isEditMode}
                error={errors.bankInfo?.name?.message}
              >
                <Input
                  {...register('bankInfo.name')}
                  placeholder="은행명을 입력하세요"
                  error={!!errors.bankInfo?.name}
                />
              </FieldWrapper>

              <FieldWrapper
                label="계좌번호"
                value={data?.bankInfo?.accountNumber}
                isEditMode={isEditMode}
                error={errors.bankInfo?.accountNumber?.message}
              >
                <Input
                  {...register('bankInfo.accountNumber')}
                  placeholder="계좌번호를 입력하세요"
                  error={!!errors.bankInfo?.accountNumber}
                />
              </FieldWrapper>

              <FieldWrapper
                label="예금주"
                value={data?.bankInfo?.accountHolder}
                isEditMode={isEditMode}
                error={errors.bankInfo?.accountHolder?.message}
              >
                <Input
                  {...register('bankInfo.accountHolder')}
                  placeholder="예금주명을 입력하세요"
                  error={!!errors.bankInfo?.accountHolder}
                />
              </FieldWrapper>
            </FormGrid>
          </Section>
        </FormContent>

        {isEditMode && (
          <ButtonGroup>
            {showCancelButton && (
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
            )}
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : submitButtonText}
            </SubmitButton>
          </ButtonGroup>
        )}
      </form>
    </FormContainer>
  );
}

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

const CancelButton = tw.button`
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

// 조회모드용 스타일 컴포넌트
const Header = tw.div`
  px-6 
  py-4 
  border-b 
  border-gray-200
`;

const HeaderContent = tw.div`
  flex 
  items-center 
  justify-between
`;

const Title = tw.h1`
  text-xl 
  font-semibold 
  text-gray-900
`;

const EditButton = tw.button`
  px-4 
  py-2 
  bg-blue-600 
  text-white 
  rounded-lg 
  hover:bg-blue-700 
  transition-colors
  font-medium
`;

const InfoItem = tw.div`
  space-y-1
`;

const InfoLabel = tw.dt`
  text-sm 
  font-medium 
  text-gray-500
`;

const InfoValue = tw.dd`
  text-sm 
  text-gray-900
`;
