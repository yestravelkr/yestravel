import { Suspense, lazy } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { FormCard, FormSection } from '@/shared/components/form/FormLayout';

const CKEditorWrapper = lazy(
  () => import('@/shared/components/editor/CKEditorWrapper'),
);

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
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded border bg-gray-100" />
          }
        >
          <CKEditorWrapper
            value={detailContent}
            onChange={(value) => setValue('detailContent', value)}
          />
        </Suspense>
      </FormSection>
    </FormCard>
  );
}
