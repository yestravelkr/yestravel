import tw from 'tailwind-styled-components';

import { FEATURES } from '../constants';

/**
 * FeaturesSection - 서비스 특장점 카드 영역
 */
export function FeaturesSection() {
  return (
    <FeaturesWrapper id="features">
      <FeaturesInner>
        <FeatureCardGrid>
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i}>
              <FeatureSubtitle>{feature.subtitle}</FeatureSubtitle>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureMutedText>{feature.description}</FeatureMutedText>
            </FeatureCard>
          ))}
        </FeatureCardGrid>
      </FeaturesInner>
    </FeaturesWrapper>
  );
}

// --- Styled Components ---

const FeaturesWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center
`;

const FeaturesInner = tw.div`
  w-full
  bg-[#f4f4f5] rounded-[32px]
  flex flex-col items-center justify-center
  px-5 py-16
`;

const FeatureCardGrid = tw.div`
  w-full
  flex flex-col lg:flex-row
  items-center justify-center
  gap-12 tablet:gap-16 lg:gap-5
  text-center overflow-clip
`;

const FeatureCard = tw.div`
  flex-1 min-w-0 min-h-0
  flex flex-col items-center gap-1
  overflow-clip
`;

const FeatureSubtitle = tw.p`
  w-full font-bold text-lg leading-6
  text-[#18181b]
`;

const FeatureTitle = tw.p`
  w-full font-bold text-[36px] leading-[48px]
  text-[#18181b]
`;

const FeatureMutedText = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
  text-[#71717a]
`;
