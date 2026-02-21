import tw from 'tailwind-styled-components';

import type { PortfolioSectionProps } from '../constants';

/**
 * PortfolioSection - 포트폴리오 카드 그리드 섹션 (정보형/방문형 피드)
 */
export function PortfolioSection({
  id,
  title,
  description,
  cards,
}: PortfolioSectionProps) {
  return (
    <PortfolioWrapper id={id}>
      <PortfolioInner>
        <SectionTitleGroup>
          <SectionTitle>{title}</SectionTitle>
          <SectionDescription>{description}</SectionDescription>
        </SectionTitleGroup>
        <CardGrid>
          {cards.map((card, i) => (
            <PortfolioCardItem key={i}>
              <CardImagePlaceholder />
              <CardOverlay>
                <CardBadge>{card.label}</CardBadge>
                <CardTitle>{card.title}</CardTitle>
              </CardOverlay>
            </PortfolioCardItem>
          ))}
        </CardGrid>
      </PortfolioInner>
    </PortfolioWrapper>
  );
}

// --- Styled Components ---

const PortfolioWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  flex flex-col items-center justify-center
  gap-16
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
`;

const PortfolioInner = tw.div`
  w-full max-w-[1220px]
  flex flex-col items-start gap-8
`;

const SectionTitleGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-[#18181b] text-center
`;

const SectionTitle = tw.h2`
  w-full font-bold text-[27px] leading-[36px]
`;

const SectionDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const CardGrid = tw.div`
  w-full
  grid grid-cols-2 gap-2
  lg:grid-cols-4 lg:gap-5
`;

const PortfolioCardItem = tw.div`
  min-w-0 min-h-0
  aspect-[280/420]
  flex flex-col items-start justify-end
  overflow-clip rounded-xl
  relative
`;

const CardImagePlaceholder = tw.div`
  absolute inset-0
  bg-gray-300 rounded-xl
`;

const CardOverlay = tw.div`
  relative w-full
  flex flex-col items-start justify-center gap-2
  px-5 pb-5 pt-12
  bg-gradient-to-t from-black/50 to-transparent
`;

const CardBadge = tw.span`
  flex items-center justify-center
  h-5 min-w-[20px] px-1
  bg-[#18181b] rounded-lg
  font-medium text-xs leading-4 text-white
`;

const CardTitle = tw.p`
  w-full font-bold text-lg leading-6 text-white
`;
