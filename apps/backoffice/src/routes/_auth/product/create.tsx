/**
 * Product Create Page - 상품 등록 페이지
 *
 * ProductTemplate과 동일한 폼 구조를 사용합니다.
 * - 기본 정보 (썸네일, 상품명, 설명)
 * - 상품 구분 (브랜드, 연결된 품목)
 * - 상세 정보 (기준/최대 인원, 입/퇴실 시간, 침대 구성, 태그)
 * - 상세 페이지 (리치 텍스트 에디터)
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system/button';
import { type FormEvent, useState } from 'react';

import { BasicInfoCard } from '../product-template/_components/create/BasicInfoCard';
import { ProductTemplateAssociationCard } from '../product-template/_components/create/ProductTemplateAssociationCard';
import { ProductTemplateDetailInfoCard } from '../product-template/_components/create/ProductTemplateDetailInfoCard';
import { ProductTemplateDetailPageCard } from '../product-template/_components/create/ProductTemplateDetailPageCard';
import {
  CancelButton,
  Form,
  FormActions,
  FormColumns,
  FormContainer,
  LeftColumn,
  RightColumn,
  SecondaryButton,
} from '../product-template/_components/create/styled';

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
    // TODO: 실제 상품 생성 API 연결
    console.log('상품 생성 처리');
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  return (
    <MajorPageLayout
      title="새 상품 등록"
      description="새로운 상품을 등록하여 판매를 시작하세요."
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
              <ProductTemplateAssociationCard />
              <ProductTemplateDetailInfoCard />
            </LeftColumn>

            <RightColumn>
              <ProductTemplateDetailPageCard />
            </RightColumn>
          </FormColumns>

          <FormActions>
            <SecondaryButton type="button" onClick={handleCancel}>
              취소
            </SecondaryButton>
            <Button type="submit" kind="primary" variant="solid" size="large">
              상품 등록
            </Button>
          </FormActions>
        </Form>
      </FormContainer>
    </MajorPageLayout>
  );
}

/**
 * Usage:
 *
 * Product 등록 페이지는 ProductTemplate과 동일한 구조를 사용합니다.
 * (판매 정보는 추후 추가 예정)
 *
 * 라우트: /product/create
 */
