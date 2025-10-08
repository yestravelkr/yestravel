import { FieldHint, FileUploadCard, Label, ThumbnailGrid } from './styled';

import {
  FormCard,
  FormField,
  FormSection,
} from '@/shared/components/form/FormLayout';
import { Input } from '@/shared/components/form/Input';
import { Textarea } from '@/shared/components/form/Textarea';
import { FileUpload } from '@/shared/components/ui/FileUpload';

interface BasicInfoCardProps {
  thumbnails: string[];
  onAddThumbnail: (url: string) => void;
  onRemoveThumbnail: (url: string) => void;
}

export function BasicInfoCard({
  thumbnails,
  onAddThumbnail,
  onRemoveThumbnail,
}: BasicInfoCardProps) {
  return (
    <FormCard
      title="기본 정보"
      description="채널 노출에 필요한 기본 속성을 입력하세요."
    >
      <FormSection>
        <FormField>
          <Label>상품 썸네일</Label>
          <ThumbnailGrid>
            {thumbnails.map((thumbnail) => (
              <FileUploadCard>
                <FileUpload
                  key={thumbnail}
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
            name="productName"
            placeholder="예) 제주 2박 3일 패키지"
          />
        </FormField>
        <FormField>
          <Label htmlFor="product-description">상품 설명</Label>
          <Textarea
            id="product-description"
            name="productDescription"
            rows={4}
            placeholder="상품의 특징과 핵심 혜택을 간단히 정리하세요."
          />
        </FormField>
      </FormSection>
    </FormCard>
  );
}
