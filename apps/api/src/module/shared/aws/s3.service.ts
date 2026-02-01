import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
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
  publicRead?: boolean; // public 읽기 권한 허용 여부
}

interface UploadBufferParams {
  buffer: Buffer;
  fileName: string; // 저장할 파일명 (확장자 포함)
  path: string; // 업로드 경로
  contentType: string; // MIME type
}

interface UploadBufferResult {
  fileUrl: string;
  fileKey: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    if (!ConfigProvider.aws) {
      throw new Error('AWS configuration is not defined');
    }

    this.region = ConfigProvider.aws.region;
    this.bucket = ConfigProvider.aws.s3.bucket;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: ConfigProvider.aws.accessKeyId,
        secretAccessKey: ConfigProvider.aws.secretAccessKey,
      },
    });
  }

  async generatePresignedUrl(
    params: GeneratePresignedUrlParams
  ): Promise<PresignedUrlResult> {
    const { fileName, fileType, path, expiresIn = 300 } = params;

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
        // Public 읽기 권한 설정
        ACL: 'public-read',
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

  /**
   * Buffer를 S3에 직접 업로드
   */
  async uploadBuffer(params: UploadBufferParams): Promise<UploadBufferResult> {
    const { buffer, fileName, path, contentType } = params;

    // 경로 정리
    const sanitizedPath = this.sanitizePath(path);

    // S3 key 생성 (path/fileName)
    const key = sanitizedPath ? `${sanitizedPath}/${fileName}` : fileName;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        fileUrl,
        fileKey: key,
      };
    } catch (error) {
      throw new Error(`Failed to upload buffer to S3: ${error.message}`);
    }
  }

  /**
   * GetObject용 presigned URL 생성 (다운로드용)
   */
  async generateDownloadUrl(
    fileKey: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }
}
