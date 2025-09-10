import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ConfigProvider } from '@src/config';

interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
}

interface GeneratePresignedUrlParams {
  fileName: string; // 확장자를 포함한 파일명
  fileType: string; // MIME type
  path: string; // 업로드 경로
  expiresIn?: number; // 만료 시간 (초)
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.region = ConfigProvider.aws?.region || 'ap-northeast-2';
    this.bucket = ConfigProvider.aws?.s3?.bucket || '';

    if (!this.bucket) {
      throw new Error('S3 bucket name is not configured');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: ConfigProvider.aws?.accessKeyId || '',
        secretAccessKey: ConfigProvider.aws?.secretAccessKey || '',
      },
    });
  }

  async generatePresignedUrl(
    params: GeneratePresignedUrlParams
  ): Promise<PresignedUrlResult> {
    const { fileName, fileType, path, expiresIn = 300 } = params;

    // 파일 타입 검증
    this.validateFileType(fileType);

    // 파일명 검증 및 확장자 추출
    const extension = this.extractExtension(fileName);
    if (!extension) {
      throw new BadRequestException('File name must include an extension');
    }

    // 경로 검증 및 정리
    const sanitizedPath = this.sanitizePath(path);

    // 안전한 파일명 생성 (UUID + 원본 확장자)
    const safeFileName = `${uuidv4()}${extension}`;

    // S3 key 생성 (path/fileName)
    const key = sanitizedPath
      ? `${sanitizedPath}/${safeFileName}`
      : safeFileName;

    try {
      // Presigned URL 생성
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        fileUrl,
        fileKey: key,
        fileName: safeFileName,
      };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  private validateFileType(mimeType: string): void {
    const allowedTypes = [
      // 이미지
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // 문서
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} is not allowed`);
    }
  }

  private extractExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return '';
    }
    return fileName.substring(lastDotIndex);
  }

  private sanitizePath(path: string): string {
    if (!path) return '';

    // 경로 정리: 슬래시 정규화, 위험한 문자 제거
    return path
      .replace(/[^a-zA-Z0-9\-_\/]/g, '') // 안전한 문자만 허용
      .replace(/\/+/g, '/') // 중복 슬래시 제거
      .replace(/^\/|\/$/g, ''); // 시작/끝 슬래시 제거
  }

  getFileUrl(fileKey: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
  }
}
