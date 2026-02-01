import type { FileLoader, UploadAdapter } from '@ckeditor/ckeditor5-upload';

import { uploadFile } from '@/utils/upload';

/**
 * CKEditor용 S3 업로드 어댑터
 * presigned URL 방식으로 S3에 이미지 업로드
 */
class S3UploadAdapter implements UploadAdapter {
  private loader: FileLoader;
  private abortController: AbortController | null = null;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;

    if (!file) {
      throw new Error('No file to upload');
    }

    this.abortController = new AbortController();

    const fileUrl = await uploadFile(file, {
      path: 'editor-images',
    });

    return { default: fileUrl };
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

/**
 * CKEditor 플러그인: S3 업로드 어댑터 연결
 */
export function S3UploadAdapterPlugin(editor: any): void {
  editor.plugins.get('FileRepository').createUploadAdapter = (
    loader: FileLoader,
  ) => {
    return new S3UploadAdapter(loader);
  };
}
