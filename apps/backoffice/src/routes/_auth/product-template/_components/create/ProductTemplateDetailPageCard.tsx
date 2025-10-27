import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { FormCard, FormSection } from '@/shared/components/form/FormLayout';

interface ProductTemplateDetailPageCardProps {
  /** React Hook Form setValue */
  setValue: UseFormSetValue<any>;
  /** React Hook Form watch */
  watch: UseFormWatch<any>;
}

export function ProductTemplateDetailPageCard({
  setValue,
  watch,
}: ProductTemplateDetailPageCardProps) {
  const detailContent = watch('detailContent') || '';

  return (
    <FormCard title="상세 페이지">
      <FormSection>
        <ReactQuill
          theme="snow"
          value={detailContent}
          onChange={(value) => setValue('detailContent', value)}
        />
      </FormSection>
    </FormCard>
  );
}
