import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system/button';
import { type FormEvent, useState } from 'react';

import { BasicInfoCard } from './_components/create/BasicInfoCard';
import { ProductAssociationCard } from './_components/create/ProductAssociationCard';
import { ProductDetailInfoCard } from './_components/create/ProductDetailInfoCard';
import { ProductDetailPageCard } from './_components/create/ProductDetailPageCard';
import {
  CancelButton,
  Form,
  FormActions,
  FormColumns,
  FormContainer,
  LeftColumn,
  RightColumn,
  SecondaryButton,
} from './_components/create/styled';

import { MajorPageLayout } from '@/components/layout';

export const Route = createFileRoute('/_auth/product/create')({
  component: CreateProductPage,
});

function CreateProductPage() {
  const navigate = useNavigate();
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const handleCancel = () => {
    navigate({ to: '/product' });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // TODO: 실제 품목 생성 API 연결
    console.log('품목 생성 처리');
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  return (
    <MajorPageLayout
      title="새 품목 등록"
      description="새로운 품목을 등록하여 관리를 시작하세요."
      headerActions={<CancelButton to="/product">취소</CancelButton>}
    >
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <FormColumns>
            <LeftColumn>
              <BasicInfoCard
                thumbnails={thumbnails}
                onAddThumbnail={handleAddThumbnail}
                onRemoveThumbnail={handleRemoveThumbnail}
              />
              <ProductAssociationCard />
              <ProductDetailInfoCard />
            </LeftColumn>

            <RightColumn>
              <ProductDetailPageCard />
            </RightColumn>
          </FormColumns>

          <FormActions>
            <SecondaryButton type="button" onClick={handleCancel}>
              취소
            </SecondaryButton>
            <Button type="submit" kind="primary" variant="solid" size="large">
              품목 등록
            </Button>
          </FormActions>
        </Form>
      </FormContainer>
    </MajorPageLayout>
  );
}
