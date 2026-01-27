import tw from 'tailwind-styled-components';

import { FormField, FileUpload } from '@/shared/components';

interface ImageFileFieldProps {
  /** 필드 라벨 */
  label: string;
  /** 편집 모드 여부 */
  isEditMode: boolean;
  /** 파일 URL */
  fileUrl?: string | null;
  /** 에러 메시지 */
  error?: string;
  /** 값 변경 핸들러 */
  onChange: (url: string | null) => void;
  /** 업로드 경로 (기본: images) */
  uploadPath?: string;
}

/**
 * ImageFileField - 이미지 파일 업로드 필드
 *
 * 편집 모드에서는 FileUpload, 보기 모드에서는 썸네일 표시
 *
 * Usage:
 * ```tsx
 * <ImageFileField
 *   label="사업자등록증 사본"
 *   isEditMode={isEditMode}
 *   fileUrl={licenseFileUrl}
 *   onChange={(url) => setValue('licenseFileUrl', url)}
 *   error={errors.licenseFileUrl?.message}
 * />
 * ```
 */
export function ImageFileField({
  label,
  isEditMode,
  fileUrl,
  error,
  onChange,
  uploadPath = 'images',
}: ImageFileFieldProps) {
  if (isEditMode) {
    return (
      <FormField label={label} error={error}>
        <FileUpload
          value={fileUrl}
          onChange={onChange}
          accept="image/*"
          uploadPath={uploadPath}
          error={!!error}
        />
      </FormField>
    );
  }

  return (
    <InfoItem>
      <InfoLabel>{label}</InfoLabel>
      {fileUrl ? (
        <ImageThumbnail>
          <img src={fileUrl} alt={label} />
          <ThumbnailOverlay onClick={() => window.open(fileUrl, '_blank')}>
            <span>크게보기</span>
          </ThumbnailOverlay>
        </ImageThumbnail>
      ) : (
        <InfoValue>-</InfoValue>
      )}
    </InfoItem>
  );
}

/**
 * @deprecated ImageFileField를 사용하세요
 */
export const LicenseFileField = ImageFileField;

const InfoItem = tw.div`
  flex flex-col
  gap-2
`;

const InfoLabel = tw.label`
  text-[15px]
  leading-5
  text-[var(--fg-muted,#71717A)]
`;

const InfoValue = tw.div`
  h-11
  flex items-center
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
`;

const ImageThumbnail = tw.div`
  relative
  w-32
  h-32
  rounded-lg
  overflow-hidden
  border
  border-gray-200
  cursor-pointer
  mt-2
  group

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailOverlay = tw.div`
  absolute
  inset-0
  transition-all
  duration-200
  flex
  items-center
  justify-center
  opacity-0
  group-hover:opacity-100
  text-white
  text-sm
  font-medium
  [background-color:transparent]
  group-hover:[background-color:#0008]
`;
