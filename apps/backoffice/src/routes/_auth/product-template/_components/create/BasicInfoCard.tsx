/**
 * BasicInfoCard - 기본 정보 입력 카드
 *
 * ProductTemplate과 Product 등록 시 공통으로 사용하는 기본 정보를 입력받습니다.
 * - 썸네일 이미지 (여러 장)
 * - 상품명/품목명
 * - 상품 설명
 */

import { UseFormRegister } from 'react-hook-form';

import { FileUploadCard, Label, ThumbnailGrid } from './styled';

import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';
import { Input } from '@/shared/components/form/Input';
import { Textarea } from '@/shared/components/form/Textarea';
import { FileUpload } from '@/shared/components/ui/FileUpload';

interface BasicInfoCardProps {
  /** 썸네일 이미지 URL 배열 */
  thumbnails: string[];
  /** 썸네일 추가 콜백 */
  onAddThumbnail: (url: string) => void;
  /** 썸네일 제거 콜백 */
  onRemoveThumbnail: (url: string) => void;
  /** React Hook Form register */
  register: UseFormRegister<any>;
}

export function BasicInfoCard({
  thumbnails,
  onAddThumbnail,
  onRemoveThumbnail,
  register,
}: BasicInfoCardProps) {
  return (
    <FormCard title="기본 정보">
      <FormSection>
        <FormField>
          <Label>상품 썸네일</Label>
          <ThumbnailGrid>
            {thumbnails.map((thumbnail) => (
              <FileUploadCard key={thumbnail}>
                <FileUpload
                  value={thumbnail}
                  onChange={(url) => {
                    if (!url) {
                      onRemoveThumbnail(thumbnail);
                    }
                  }}
                  accept="image/*"
                  uploadPath="product/thumbnail"
                />
              </FileUploadCard>
            ))}
            <FileUploadCard>
              <FileUpload
                value={null}
                onChange={(url) => {
                  if (!url) return;
                  onAddThumbnail(url);
                }}
                accept="image/*"
                uploadPath="product/thumbnail"
              />
            </FileUploadCard>
          </ThumbnailGrid>
        </FormField>
        <FormField>
          <Label htmlFor="product-name">상품명</Label>
          <Input
            id="product-name"
            placeholder="예) 제주 2박 3일 패키지"
            {...register('name')}
          />
        </FormField>
        <FormField>
          <Label htmlFor="product-description">상품 설명</Label>
          <Textarea
            id="product-description"
            rows={4}
            placeholder="상품의 특징과 핵심 혜택을 간단히 정리하세요."
            {...register('description')}
          />
        </FormField>
      </FormSection>
    </FormCard>
  );
}

/**
 * Usage:
 *
 * <BasicInfoCard
 *   thumbnails={thumbnails}
 *   onAddThumbnail={handleAddThumbnail}
 *   onRemoveThumbnail={handleRemoveThumbnail}
 * />
 */
