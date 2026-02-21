import { Download } from 'lucide-react';
import tw from 'tailwind-styled-components';

/**
 * HeroSection - 메인 히어로 배너 영역
 */
export function HeroSection() {
  return (
    <HeroWrapper>
      <HeroImagePlaceholder />
      <HeroContent>
        <HeroTextGroup>
          <HeroTitle>
            YESTRAVEL
            <br />
            Marketing Solution
          </HeroTitle>
          <HeroDescription>
            여행부터 라이프스타일 제품까지.
            <br />
            브랜드의 매출과 브랜딩을 동시에 해결하는
            <br />
            인플루언서 커머스 &amp; 마케팅 플랫폼
          </HeroDescription>
        </HeroTextGroup>
        <HeroButtonGroup>
          <HeroPrimaryButton>
            <Download className="size-[18px]" color="white" />
            <HeroButtonLabel>제안서 다운로드</HeroButtonLabel>
          </HeroPrimaryButton>
          <HeroSecondaryButton
            onClick={() =>
              document
                .getElementById('portfolio')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <HeroButtonLabel>레퍼런스 보기</HeroButtonLabel>
          </HeroSecondaryButton>
        </HeroButtonGroup>
      </HeroContent>
    </HeroWrapper>
  );
}

// --- Styled Components ---

const HeroWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  flex flex-col items-center
  gap-6 tablet:gap-8 lg:gap-8
  bg-white overflow-clip
  pb-12 tablet:pb-16 lg:pb-[96px]
`;

const HeroImagePlaceholder = tw.div`
  w-full
  h-[200px] tablet:h-[240px] lg:h-[400px]
  bg-gray-200 rounded-[20px]
`;

const HeroContent = tw.div`
  w-full flex flex-col items-center justify-center
  gap-8
`;

const HeroTextGroup = tw.div`
  w-full flex flex-col items-start
  gap-3 text-center text-[#18181b]
`;

const HeroTitle = tw.h1`
  w-full font-bold
  text-[24px] leading-[32px]
  tablet:text-[27px] tablet:leading-[36px]
  lg:text-[36px] lg:leading-[48px]
`;

const HeroDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const HeroButtonGroup = tw.div`
  w-full lg:w-auto
  flex flex-col lg:flex-row
  items-start gap-2
`;

const HeroPrimaryButton = tw.button`
  w-full lg:w-[200px]
  h-[52px]
  flex items-center justify-center gap-1
  px-4 rounded-[27px]
  bg-[#18181b]
`;

const HeroSecondaryButton = tw.button`
  w-full lg:w-[200px]
  h-[52px]
  flex items-center justify-center
  px-4 rounded-[27px]
  bg-[#449afc]
`;

const HeroButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-white px-1
`;
