/**
 * ProductDetailContent - 상품 상세 콘텐츠
 *
 * 백엔드에서 받은 HTML을 렌더링합니다.
 * 기본적으로 접혀있고, "더보기" 버튼을 클릭하면 전체 내용이 표시됩니다.
 * XSS 방지를 위해 DOMPurify로 HTML을 sanitize합니다.
 */

import DOMPurify from 'dompurify';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

export interface ProductDetailContentProps {
  /** 백엔드에서 받은 HTML 콘텐츠 */
  htmlContent: string;
  /** 접힌 상태에서의 최대 높이 (px) */
  collapsedHeight?: number;
}

export function ProductDetailContent({
  htmlContent,
  collapsedHeight = 840,
}: ProductDetailContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // XSS 방지를 위해 HTML sanitize
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);

  return (
    <Container>
      <ContentWrapper
        $isExpanded={isExpanded}
        style={!isExpanded ? { maxHeight: `${collapsedHeight}px` } : undefined}
      >
        <HtmlContent dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        {!isExpanded && <GradientOverlay />}
      </ContentWrapper>
      {!isExpanded && (
        <ExpandButtonWrapper>
          <ExpandButton onClick={() => setIsExpanded(true)}>
            <span>상품정보 더보기</span>
            <ChevronDown size={20} />
          </ExpandButton>
        </ExpandButtonWrapper>
      )}
    </Container>
  );
}

const Container = tw.div`
  w-full
  relative
`;

const ContentWrapper = tw.div<{
  $isExpanded: boolean;
}>`
  w-full
  relative
  overflow-hidden
`;

const HtmlContent = tw.div`
  w-full
  [&_img]:w-full
  [&_img]:h-auto
`;

const GradientOverlay = tw.div`
  absolute
  bottom-0
  left-0
  right-0
  h-20
  bg-gradient-to-t
  from-white
  to-transparent
  pointer-events-none
`;

const ExpandButtonWrapper = tw.div`
  absolute
  bottom-0
  left-0
  right-0
  p-5
  bg-white
`;

const ExpandButton = tw.button`
  w-full
  h-11
  px-3
  bg-bg-neutral-subtle
  rounded-xl
  outline
  outline-1
  outline-stroke-neutral
  flex
  items-center
  justify-center
  gap-1
  text-base
  font-medium
  text-fg-neutral
  leading-5
  hover:bg-bg-neutral
  transition-colors
`;

/**
 * Usage:
 *
 * <ProductDetailContent
 *   htmlContent="<p>상품 설명...</p><img src='...' />"
 *   collapsedHeight={840}
 * />
 */
