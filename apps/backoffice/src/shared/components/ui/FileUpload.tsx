import { useState, useRef } from 'react';
import tw from 'tailwind-styled-components';

import { uploadFile } from '@/utils/upload';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // bytes
  uploadPath?: string;
}

export function FileUpload({
  value,
  onChange,
  placeholder = '파일을 선택하세요',
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
          <FileInfo>
            <FilePreview>
              <img src={value} alt="업로드된 파일" />
            </FilePreview>
            <FileDetails>
              <FileName>파일이 업로드되었습니다</FileName>
              <RemoveButton
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                삭제
              </RemoveButton>
            </FileDetails>
          </FileInfo>
        ) : (
          <UploadPrompt>
            {isUploading ? (
              <UploadingState>
                <Spinner />
                <span>업로드 중...</span>
              </UploadingState>
            ) : (
              <EmptyState>
                <UploadIcon>📁</UploadIcon>
                <UploadText>{placeholder}</UploadText>
                <UploadHint>클릭하여 파일 선택</UploadHint>
              </EmptyState>
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
  border-2
  border-dashed
  rounded-lg
  cursor-pointer
  transition-colors
  ${({ $error }) =>
    $error
      ? 'border-red-300 bg-red-50'
      : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}
`;

const FileInfo = tw.div`
  p-4
  flex
  items-center
  gap-4
`;

const FilePreview = tw.div`
  w-16
  h-16
  rounded-lg
  overflow-hidden
  bg-gray-100
  flex-shrink-0
`;

const FileDetails = tw.div`
  flex-1
  flex
  items-center
  justify-between
`;

const FileName = tw.span`
  text-sm
  text-gray-700
  font-medium
`;

const RemoveButton = tw.button`
  px-3
  py-1
  text-xs
  text-red-600
  hover:text-red-800
  border
  border-red-200
  hover:border-red-300
  rounded
  transition-colors
`;

const UploadPrompt = tw.div`
  p-8
  flex
  flex-col
  items-center
  justify-center
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
  flex
  flex-col
  items-center
  gap-2
`;

const UploadIcon = tw.div`
  text-3xl
  mb-2
`;

const UploadText = tw.span`
  text-sm
  font-medium
  text-gray-700
`;

const UploadHint = tw.span`
  text-xs
  text-gray-500
`;

const ErrorMessage = tw.div`
  mt-2
  text-sm
  text-red-600
`;
