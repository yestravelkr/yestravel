import tw from 'tailwind-styled-components';

import { PARTNER_LOGO_ROW1, PARTNER_LOGO_ROW2 } from '../constants';

/**
 * PartnersSection - 주요 고객사 파트너 로고 마퀴 영역
 */
export function PartnersSection() {
  return (
    <PartnersWrapper>
      <PartnersTitleGroup>
        <PartnersTitle>YESTRAVEL과 함께하는 주요 고객사</PartnersTitle>
        <PartnersSubtitle>
          600여 브랜드와 함께 2,500회 이상의 캠페인을 성공으로 이끌었습니다.
        </PartnersSubtitle>
      </PartnersTitleGroup>
      <MarqueeContainer>
        <MarqueeTrack $direction="left">
          <MarqueeImage src={PARTNER_LOGO_ROW1} alt="" />
          <MarqueeImage src={PARTNER_LOGO_ROW1} alt="" />
        </MarqueeTrack>
      </MarqueeContainer>
      <MarqueeContainer>
        <MarqueeTrack $direction="right">
          <MarqueeImage src={PARTNER_LOGO_ROW2} alt="" />
          <MarqueeImage src={PARTNER_LOGO_ROW2} alt="" />
        </MarqueeTrack>
      </MarqueeContainer>
    </PartnersWrapper>
  );
}

// --- Styled Components ---

const PartnersWrapper = tw.section`
  w-full
  flex flex-col items-center justify-center gap-8
  bg-[#18181b]
  py-12 tablet:py-16 lg:py-16
`;

const PartnersTitleGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-white text-center
`;

const PartnersTitle = tw.h2`
  w-full font-bold
  text-[21px] tablet:text-[27px] lg:text-[27px]
  leading-[36px]
`;

const PartnersSubtitle = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const MarqueeContainer = tw.div`
  w-full overflow-hidden
`;

const MarqueeTrack = tw.div<{ $direction: 'left' | 'right' }>`
  flex items-center w-max
  ${({ $direction }) =>
    $direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}
`;

const MarqueeImage = tw.img`
  h-[50px] w-auto shrink-0 object-contain
  mr-8
`;
