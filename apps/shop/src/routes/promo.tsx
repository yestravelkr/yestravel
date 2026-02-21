import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { ContactBar } from './promo/components/ContactBar';
import { FaqSection } from './promo/components/FaqSection';
import { FeaturesSection } from './promo/components/FeaturesSection';
import { FooterSection } from './promo/components/FooterSection';
import { HeaderSection } from './promo/components/HeaderSection';
import { HeroSection } from './promo/components/HeroSection';
import { MusesSection } from './promo/components/MusesSection';
import { PartnersSection } from './promo/components/PartnersSection';
import { PortfolioSection } from './promo/components/PortfolioSection';
import { INFO_FEED_CARDS, VISIT_FEED_CARDS } from './promo/constants';

export const Route = createFileRoute('/promo')({
  component: PromoPage,
});

/**
 * PromoPage - 예스트래블 마케팅 솔루션 프로모션 랜딩 페이지
 *
 * 반응형 breakpoints:
 * - 모바일: 360px~ (기본 스타일)
 * - 태블릿: 600px~ (tablet:)
 * - 데스크톱: 1024px+ (lg:)
 */
function PromoPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const [selectedInfluencer, setSelectedInfluencer] = useState<number>(0);

  return (
    <PageWrapper>
      <HeaderSection />
      <HeroSection />
      <PartnersSection />
      <PortfolioSection
        id="portfolio"
        title="정보형 피드와 릴스"
        description="매출 전환과 클릭률(CTR)에 최적화된 소구점 중심 콘텐츠"
        cards={INFO_FEED_CARDS}
      />
      <PortfolioSection
        title="방문형 피드와 릴스"
        description="매출 전환과 클릭률(CTR)에 최적화된 소구점 중심 콘텐츠"
        cards={VISIT_FEED_CARDS}
      />
      <FeaturesSection />
      <MusesSection
        selectedIndex={selectedInfluencer}
        onSelect={setSelectedInfluencer}
      />
      <FaqSection openIndex={openFaqIndex} onToggle={setOpenFaqIndex} />
      <FooterSection />
      <ContactBar />
    </PageWrapper>
  );
}

const PageWrapper = tw.div`
  w-full min-h-screen bg-white
  flex flex-col items-start
  overflow-clip rounded-[32px]
`;
