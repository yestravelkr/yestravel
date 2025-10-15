import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { FormCard, FormSection } from '@/shared/components/form/FormLayout';

export function ProductTemplateDetailPageCard() {
  const [editorValue, setEditorValue] = useState('');

  return (
    <FormCard title="상세 페이지">
      <FormSection>
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={setEditorValue}
        />
      </FormSection>
    </FormCard>
  );
}
