import axios from 'axios';

import { trpc } from '@/shared/trpc';

export interface UploadOptions {
  path?: string;
}

/**
 * 파일을 S3에 업로드하는 유틸리티 함수
 * @param file - 업로드할 파일
 * @param options - 업로드 옵션
 * @returns 업로드된 파일 URL
 * @throws 업로드 실패 시 에러를 throw
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<string> {
  const { path = 'uploads' } = options;

  // 1. presigned URL 생성
  const { uploadUrl, fileUrl } =
    await trpc.backofficeUpload.generatePresignedUrl.mutate({
      fileName: file.name,
      fileType: file.type,
      path,
      expiresIn: 300,
    });

  // 2. S3에 파일 업로드
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  return fileUrl;
}
