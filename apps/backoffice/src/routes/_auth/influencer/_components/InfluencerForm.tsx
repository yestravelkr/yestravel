/**
 * InfluencerForm - 인플루언서 등록/수정 폼 컴포넌트
 *
 * Brand 폼과 유사한 구조로 작성되었으며, 소셜미디어 링크 추가 기능이 포함됩니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { Input, Select, FieldWrapper, FileUpload } from '@/shared/components';

interface InfluencerFormData {
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

interface InfluencerFormProps {
  data?: InfluencerFormData;
  isEditMode?: boolean;
  onSubmit?: (data: InfluencerFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function InfluencerForm({
  data,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
  submitButtonText = '저장',
  showCancelButton = false,
  onCancel,
  onEdit,
}: InfluencerFormProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(
    data?.thumbnail,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<InfluencerFormData>({
    defaultValues: data || {
      socialMedias: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialMedias',
  });

  const businessTypeOptions = [
    { value: '', label: '선택하세요' },
    { value: 'INDIVIDUAL', label: '개인 사업자' },
    { value: 'SOLE_PROPRIETOR', label: '간이 사업자' },
    { value: 'CORPORATION', label: '법인 사업자' },
  ];

  const platformOptions = [
    { value: 'INSTAGRAM', label: '인스타그램' },
    { value: 'FACEBOOK', label: '페이스북' },
    { value: 'TWITTER', label: '트위터' },
    { value: 'YOUTUBE', label: '유튜브' },
    { value: 'TIKTOK', label: '틱톡' },
    { value: 'WEBSITE', label: '웹사이트' },
  ];

  const handleFormSubmit = async (formData: InfluencerFormData) => {
    if (!onSubmit) return;

    try {
      await onSubmit(formData);
      if (!data) {
        reset();
        setThumbnailUrl(undefined);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    reset();
    setThumbnailUrl(data?.thumbnail);
  };

  const handleAddSocialMedia = () => {
    append({ platform: 'INSTAGRAM', url: '' });
  };

  const handleThumbnailChange = (url: string | null) => {
    const newUrl = url || undefined;
    setThumbnailUrl(newUrl);
    setValue('thumbnail', newUrl);
  };

  return (
    <FormContainer>
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
          {/* 기본 정보 */}
          <Section>
            <SectionTitle>기본 정보</SectionTitle>

            {/* 프로필 이미지 - 전체 너비 */}
            <FieldWrapper
              label="프로필 이미지"
              value={data?.thumbnail}
              isEditMode={isEditMode}
            >
              <FileUpload
                value={thumbnailUrl}
                onChange={handleThumbnailChange}
                uploadPath="influencers"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                disabled={!isEditMode}
              />
            </FieldWrapper>

            <FormGrid>
              <FieldWrapper
                label="인플루언서명"
                value={data?.name}
                isEditMode={isEditMode}
                error={errors.name?.message}
                required
              >
                <Input
                  {...register('name', {
                    required: '인플루언서명은 필수입니다',
                  })}
                  placeholder="인플루언서명을 입력하세요"
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
                  placeholder="contact@example.com"
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
            </FormGrid>
          </Section>

          {/* 소셜미디어 정보 */}
          <Section>
            <SectionHeader>
              <SectionTitle>소셜미디어</SectionTitle>
              {isEditMode && (
                <AddButton type="button" onClick={handleAddSocialMedia}>
                  <Plus size={16} />
                  소셜미디어 추가
                </AddButton>
              )}
            </SectionHeader>

            {fields.length === 0 && !isEditMode && (
              <EmptyMessage>등록된 소셜미디어가 없습니다.</EmptyMessage>
            )}

            <SocialMediaList>
              {fields.map((field, index) => (
                <SocialMediaItem key={field.id}>
                  <SocialMediaFields>
                    <PlatformSelect>
                      <Select
                        {...register(`socialMedias.${index}.platform` as const)}
                        options={platformOptions}
                      />
                    </PlatformSelect>
                    <UrlInput>
                      <Input
                        {...register(`socialMedias.${index}.url` as const, {
                          required: 'URL을 입력하세요',
                        })}
                        placeholder="https://..."
                      />
                    </UrlInput>
                    {isEditMode && (
                      <RemoveButton type="button" onClick={() => remove(index)}>
                        <X size={16} />
                      </RemoveButton>
                    )}
                  </SocialMediaFields>
                </SocialMediaItem>
              ))}
            </SocialMediaList>
          </Section>

          {/* 사업자 정보 */}
          <Section>
            <SectionTitle>사업자 정보</SectionTitle>
            <FormGrid>
              <FieldWrapper
                label="사업자 구분"
                value={data?.businessInfo?.type}
                isEditMode={isEditMode}
              >
                <Select
                  {...register('businessInfo.type')}
                  options={businessTypeOptions}
                />
              </FieldWrapper>

              <FieldWrapper
                label="사업자명"
                value={data?.businessInfo?.name}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('businessInfo.name')}
                  placeholder="사업자명을 입력하세요"
                />
              </FieldWrapper>

              <FieldWrapper
                label="사업자번호"
                value={data?.businessInfo?.licenseNumber}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('businessInfo.licenseNumber')}
                  placeholder="000-00-00000"
                />
              </FieldWrapper>

              <FieldWrapper
                label="대표자명"
                value={data?.businessInfo?.ceoName}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('businessInfo.ceoName')}
                  placeholder="대표자명을 입력하세요"
                />
              </FieldWrapper>
            </FormGrid>
          </Section>

          {/* 정산 계좌 정보 */}
          <Section>
            <SectionTitle>정산 계좌 정보</SectionTitle>
            <FormGrid>
              <FieldWrapper
                label="은행명"
                value={data?.bankInfo?.name}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('bankInfo.name')}
                  placeholder="은행명을 입력하세요"
                />
              </FieldWrapper>

              <FieldWrapper
                label="계좌번호"
                value={data?.bankInfo?.accountNumber}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('bankInfo.accountNumber')}
                  placeholder="계좌번호를 입력하세요"
                />
              </FieldWrapper>

              <FieldWrapper
                label="예금주"
                value={data?.bankInfo?.accountHolder}
                isEditMode={isEditMode}
              >
                <Input
                  {...register('bankInfo.accountHolder')}
                  placeholder="예금주를 입력하세요"
                />
              </FieldWrapper>
            </FormGrid>
          </Section>
        </FormContent>

        {/* 버튼 영역 */}
        {isEditMode && (
          <ButtonGroup>
            {showCancelButton && (
              <Button
                type="button"
                kind="neutral"
                variant="outline"
                onClick={handleCancel}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              kind="primary"
              variant="solid"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : submitButtonText}
            </Button>
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

const Header = tw.div`
  border-b
  border-gray-200
  p-6
`;

const HeaderContent = tw.div`
  flex
  justify-between
  items-center
`;

const Title = tw.h2`
  text-xl
  font-semibold
  text-gray-900
`;

const EditButton = tw.button`
  px-4
  py-2
  text-sm
  font-medium
  text-blue-600
  hover:text-blue-700
  border
  border-blue-600
  hover:border-blue-700
  rounded-lg
  transition-colors
`;

const FormContent = tw.div`
  p-6
  space-y-8
`;

const Section = tw.div`
  space-y-4
`;

const SectionHeader = tw.div`
  flex
  justify-between
  items-center
`;

const SectionTitle = tw.h3`
  text-lg
  font-semibold
  text-gray-900
`;

const FormGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  gap-6
`;

const SocialMediaList = tw.div`
  space-y-3
`;

const SocialMediaItem = tw.div`
  
`;

const SocialMediaFields = tw.div`
  flex
  gap-3
  items-start
`;

const PlatformSelect = tw.div`
  w-40
`;

const UrlInput = tw.div`
  flex-1
`;

const AddButton = tw.button`
  flex
  items-center
  gap-2
  px-3
  py-1.5
  text-sm
  font-medium
  text-blue-600
  hover:text-blue-700
  border
  border-blue-600
  hover:border-blue-700
  rounded-lg
  transition-colors
`;

const RemoveButton = tw.button`
  p-2
  text-gray-400
  hover:text-red-600
  rounded
  hover:bg-red-50
  transition-colors
`;

const EmptyMessage = tw.div`
  text-sm
  text-gray-500
  py-4
`;

const ButtonGroup = tw.div`
  flex
  justify-end
  gap-3
  p-6
  border-t
  border-gray-200
`;

/**
 * Usage:
 *
 * <InfluencerForm
 *   isEditMode={true}
 *   onSubmit={handleSubmit}
 *   isSubmitting={false}
 *   submitButtonText="등록하기"
 *   showCancelButton={true}
 *   onCancel={handleCancel}
 * />
 */
