import tw from 'tailwind-styled-components';

import { FormField, FileUpload } from '@/shared/components';

interface LicenseFileFieldProps {
  isEditMode: boolean;
  licenseFileUrl?: string | null;
  error?: string;
  onChange: (url: string | null) => void;
}

export function LicenseFileField({
  isEditMode,
  licenseFileUrl,
  error,
  onChange,
}: LicenseFileFieldProps) {
  if (isEditMode) {
    return (
      <FormField label="사업자등록증 사본" error={error}>
        <FileUpload
          value={licenseFileUrl}
          onChange={onChange}
          accept="image/*"
          uploadPath="business-license"
          error={!!error}
        />
      </FormField>
    );
  }

  return (
    <InfoItem>
      <InfoLabel>사업자등록증 사본</InfoLabel>
      {licenseFileUrl ? (
        <LicenseThumbnail>
          <img src={licenseFileUrl} alt="사업자등록증 사본" />
          <ThumbnailOverlay
            onClick={() => window.open(licenseFileUrl, '_blank')}
          >
            <span>크게보기</span>
          </ThumbnailOverlay>
        </LicenseThumbnail>
      ) : (
        <InfoValue>-</InfoValue>
      )}
    </InfoItem>
  );
}

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

const LicenseThumbnail = tw.div`
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
