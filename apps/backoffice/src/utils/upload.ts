import axios from 'axios';

import { useAuthStore } from '@/store/authStore';

const API_BASEURL = import.meta.env.VITE_API_BASEURL || 'http://localhost:3000';

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
  const token = useAuthStore.getState().accessToken;

  // 1. presigned URL 생성 - axios로 API 호출
  const { data } = await axios.post(
    `${API_BASEURL}/trpc/backofficeUpload.generatePresignedUrl`,
    {
      fileName: file.name,
      fileType: file.type,
      path,
      expiresIn: 300,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
    },
  );

  const { uploadUrl, fileUrl } = data.result?.data || {};

  if (!uploadUrl || !fileUrl) {
    throw new Error('Invalid response from server');
  }

  // 2. S3에 파일 업로드
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  return fileUrl;
}
