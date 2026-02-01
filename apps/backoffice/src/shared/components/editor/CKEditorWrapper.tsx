import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * CKEditor 래퍼 컴포넌트
 * dynamic import를 위해 분리됨
 */
export default function CKEditorWrapper({
  value,
  onChange,
}: CKEditorWrapperProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        licenseKey: 'GPL',
      }}
      data={value}
      onChange={(_, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}
