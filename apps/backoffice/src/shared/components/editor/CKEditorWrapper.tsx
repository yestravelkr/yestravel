import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import { S3UploadAdapterPlugin } from './CKEditorUploadAdapter';

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  maxWidth?: string;
}

/**
 * CKEditor 래퍼 컴포넌트
 * dynamic import를 위해 분리됨
 * S3 presigned URL 방식으로 이미지 업로드 지원
 * onBlur에서 데이터 동기화하여 리렌더링 최소화
 */
export default function CKEditorWrapper({
  value,
  onChange,
  maxWidth,
}: CKEditorWrapperProps) {
  return (
    <div style={{ maxWidth: maxWidth ?? '100%', width: '100%', minWidth: 0 }}>
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL',
          extraPlugins: [S3UploadAdapterPlugin],
        }}
        data={value}
        onBlur={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}
