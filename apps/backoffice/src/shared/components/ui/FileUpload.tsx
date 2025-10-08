import { useState, useRef } from 'react';
import tw from 'tailwind-styled-components';

import { uploadFile } from '@/utils/upload';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // bytes
  uploadPath?: string;
}

function UploadEmptyState() {
  return (
    <EmptyState>
      <UploadIcon>
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_26_5245)">
            <path
              d="M22.9167 41.6667V27.0833H8.33333C7.18274 27.0833 6.25 26.1506 6.25 25C6.25 23.8494 7.18274 22.9167 8.33333 22.9167H22.9167V8.33333C22.9167 7.18274 23.8494 6.25 25 6.25C26.1506 6.25 27.0833 7.18274 27.0833 8.33333V22.9167H41.6667C42.8173 22.9167 43.75 23.8494 43.75 25C43.75 26.1506 42.8173 27.0833 41.6667 27.0833H27.0833V41.6667C27.0833 42.8173 26.1506 43.75 25 43.75C23.8494 43.75 22.9167 42.8173 22.9167 41.6667Z"
              fill="#9E9E9E"
            />
          </g>
          <defs>
            <clipPath id="clip0_26_5245">
              <rect width="50" height="50" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </UploadIcon>
    </EmptyState>
  );
}

export function FileUpload({
  value,
  onChange,
  error = false,
  disabled = false,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  uploadPath = 'uploads',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setUploadError(null);

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(
        `파일 크기가 너무 큽니다. ${Math.round(maxSize / 1024 / 1024)}MB 이하로 선택해주세요.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file, { path: uploadPath });
      onChange(url);
    } catch (err) {
      console.error('File upload failed:', err);
      setUploadError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      <UploadArea $error={error} onClick={handleButtonClick}>
        {value ? (
          <FilePreview>
            <PreviewImage src={value} alt="업로드된 파일" />
            <RemoveButton
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_357_2453)">
                  <path
                    d="M15.2442 3.57757C15.5697 3.25214 16.0972 3.25214 16.4226 3.57757C16.7481 3.90301 16.7481 4.43052 16.4226 4.75596L11.1785 10.0001L16.4226 15.2442C16.7481 15.5697 16.7481 16.0972 16.4226 16.4226C16.0972 16.7481 15.5697 16.7481 15.2442 16.4226L10.0001 11.1785L4.75596 16.4226C4.43052 16.7481 3.90301 16.7481 3.57757 16.4226C3.25214 16.0972 3.25214 15.5697 3.57757 15.2442L8.82171 10.0001L3.57757 4.75596C3.25214 4.43052 3.25214 3.90301 3.57757 3.57757C3.90301 3.25214 4.43052 3.25214 4.75596 3.57757L10.0001 8.82171L15.2442 3.57757Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_357_2453">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </RemoveButton>
          </FilePreview>
        ) : (
          <UploadPrompt>
            {isUploading ? (
              <UploadingState>
                <Spinner />
                <span>업로드 중...</span>
              </UploadingState>
            ) : (
              <UploadEmptyState />
            )}
          </UploadPrompt>
        )}
      </UploadArea>

      {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
    </Container>
  );
}

const Container = tw.div`
  w-full
`;

const HiddenInput = tw.input`
  hidden
`;

const UploadArea = tw.div<{ $error: boolean }>`
  relative
  w-[130px]
  h-[130px]
  border
  rounded-xl
  cursor-pointer
  transition-colors
  flex
  items-start
  justify-start
  p-3
  ${({ $error }) =>
    $error
      ? 'border-red-300 bg-red-50'
      : 'border-[rgb(228,228,231)] bg-[rgb(244,244,245)] hover:bg-gray-200'}
`;

const FilePreview = tw.div`
  absolute
  inset-0
  w-[130px]
  h-[130px]
  overflow-hidden
  rounded-xl
  group
`;

const PreviewImage = tw.img`
  w-full
  h-full
  object-cover
`;

const RemoveButton = tw.button`
  absolute
  top-2
  right-2
  flex
  w-8
  h-8
  p-0
  justify-center
  items-center
  shrink-0
  rounded-2xl
  bg-black/20
  backdrop-blur-md
  cursor-pointer
  transition-opacity
`;

const UploadPrompt = tw.div`
  w-full
  h-full
  flex
  flex-col
  items-start
  justify-start
`;

const UploadingState = tw.div`
  flex
  flex-col
  items-center
  gap-2
  text-blue-600
`;

const Spinner = tw.div`
  animate-spin
  w-6
  h-6
  border-2
  border-blue-600
  border-t-transparent
  rounded-full
`;

const EmptyState = tw.div`
  w-full
  h-full
  flex
  flex-col
  items-center
  justify-center
  gap-1
`;

const UploadIcon = tw.div`
  w-[50px]
  h-[50px]
  flex
  items-center
  justify-center
`;

const ErrorMessage = tw.div`
  mt-2
  text-sm
  text-red-600
`;
