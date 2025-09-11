import { z } from 'zod';
import {
  Ctx,
  Input,
  Mutation,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { S3Service } from '@src/module/shared/aws/s3.service';
import { ConfigProvider } from '@src/config';

@Injectable()
@Router({ alias: 'backofficeUpload' })
export class UploadRouter {
  constructor(private readonly s3Service: S3Service) {}

  @Mutation({
    input: z.object({
      fileName: z.string().min(1, '파일명은 필수입니다'),
      fileType: z.string().min(1, '파일 타입은 필수입니다'),
      path: z.string().default('uploads'),
      expiresIn: z.number().min(60).max(3600).default(300),
    }),
    output: z.object({
      uploadUrl: z.string(),
      fileUrl: z.string(),
      fileKey: z.string(),
      fileName: z.string(),
    }),
  })
  async generatePresignedUrl(
    @Input()
    input: {
      fileName: string;
      fileType: string;
      path: string;
      expiresIn: number;
    }
  ) {
    
    const backofficeParams = {
      ...input,
      path: `${ConfigProvider.stage}/backoffice//${input.path}`,
    };

    return await this.s3Service.generatePresignedUrl(backofficeParams);
  }
}
