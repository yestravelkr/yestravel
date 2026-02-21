import tw from 'tailwind-styled-components';

import type { MusesSectionProps } from '../constants';
import { INFLUENCERS } from '../constants';
import { InstagramIcon, TiktokIcon, YoutubeIcon } from '../icons';

/**
 * MusesSection - 추천 인플루언서 소개 영역 (모바일 스크롤 + 데스크톱 그리드)
 */
export function MusesSection({ selectedIndex, onSelect }: MusesSectionProps) {
  const selected = INFLUENCERS[selectedIndex];

  return (
    <MusesWrapper id="muses">
      <MusesInner>
        <SectionTitleGroup>
          <SectionTitle>OUR MUSES</SectionTitle>
          <SectionDescription>
            예스트래블이 보증하는 추천 인플루언서
          </SectionDescription>
        </SectionTitleGroup>
        <MusesContentRow>
          <InfluencerDetailCard>
            <InfluencerImagePlaceholder />
            <InfluencerInfo>
              <InfluencerTextGroup>
                <InfluencerName>{selected?.name}</InfluencerName>
                <InfluencerDescription>
                  {selected?.description}
                </InfluencerDescription>
              </InfluencerTextGroup>
              <PlatformChipGroup>
                {selected?.platforms.map(platform => (
                  <PlatformChip key={platform}>
                    {platform === '인스타그램' && <InstagramIcon />}
                    {platform === '틱톡' && <TiktokIcon />}
                    {platform === '유튜브' && <YoutubeIcon />}
                    <PlatformChipLabel>{platform}</PlatformChipLabel>
                  </PlatformChip>
                ))}
              </PlatformChipGroup>
            </InfluencerInfo>
          </InfluencerDetailCard>

          {/* Mobile/Tablet: horizontal scroll */}
          <InfluencerScrollSection>
            <InfluencerScrollFadeLeft />
            <InfluencerScrollTrack>
              {INFLUENCERS.map((inf, i) => (
                <InfluencerScrollItem
                  key={inf.name}
                  onClick={() => onSelect(i)}
                >
                  <InfluencerScrollAvatar $selected={i === selectedIndex}>
                    <AvatarPlaceholder />
                  </InfluencerScrollAvatar>
                  <InfluencerScrollName>{inf.name}</InfluencerScrollName>
                </InfluencerScrollItem>
              ))}
            </InfluencerScrollTrack>
            <InfluencerScrollFadeRight />
          </InfluencerScrollSection>

          {/* Desktop: 3x5 grid */}
          <InfluencerGridSection>
            {[
              INFLUENCERS.slice(0, 5),
              INFLUENCERS.slice(5, 10),
              INFLUENCERS.slice(10, 15),
            ].map((row, rowIndex) => (
              <InfluencerAvatarRow key={rowIndex}>
                {row.map((inf, i) => {
                  const globalIndex = rowIndex * 5 + i;
                  return (
                    <InfluencerAvatarItem
                      key={inf.name}
                      onClick={() => onSelect(globalIndex)}
                    >
                      <InfluencerAvatar
                        $selected={globalIndex === selectedIndex}
                      >
                        <AvatarPlaceholder />
                      </InfluencerAvatar>
                      <InfluencerAvatarName>{inf.name}</InfluencerAvatarName>
                    </InfluencerAvatarItem>
                  );
                })}
              </InfluencerAvatarRow>
            ))}
          </InfluencerGridSection>
        </MusesContentRow>
      </MusesInner>
    </MusesWrapper>
  );
}

// --- Styled Components ---

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

const MusesWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center
`;

const MusesInner = tw.div`
  w-full
  flex flex-col items-start gap-8
`;

const MusesContentRow = tw.div`
  w-full
  flex flex-col lg:flex-row
  items-center gap-8 lg:gap-12
`;

const InfluencerDetailCard = tw.div`
  w-full tablet:max-w-[360px] tablet:mx-auto lg:max-w-none lg:mx-0
  lg:w-[400px] shrink-0
  flex flex-col items-start
  bg-[#f4f4f5] rounded-[20px]
  overflow-clip
`;

const InfluencerImagePlaceholder = tw.div`
  w-full aspect-square
  bg-gray-300
`;

const InfluencerInfo = tw.div`
  w-full flex flex-col gap-5
  items-start justify-center
  p-5 lg:px-8 lg:py-8
  lg:h-[208px]
`;

const InfluencerTextGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-[#18181b]
`;

const InfluencerName = tw.p`
  w-full font-bold
  text-[21px] lg:text-[27px]
  leading-[36px]
`;

const InfluencerDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const PlatformChipGroup = tw.div`
  flex items-start gap-2
`;

const PlatformChip = tw.div`
  h-9 flex items-center justify-center
  px-2 rounded-xl
  bg-white
  border border-solid border-[var(--stroke-neutral,#e4e4e7)]
`;

const PlatformChipLabel = tw.span`
  font-normal text-[15px] leading-5
  text-[#18181b] px-1
`;

// Mobile/Tablet: horizontal scroll avatars
const InfluencerScrollSection = tw.div`
  w-full relative
  lg:hidden
`;

const InfluencerScrollFadeLeft = tw.div`
  absolute left-0 top-0 bottom-0 w-6 z-10
  bg-gradient-to-r from-white to-transparent
  pointer-events-none
`;

const InfluencerScrollFadeRight = tw.div`
  absolute right-0 top-0 bottom-0 w-6 z-10
  bg-gradient-to-l from-white to-transparent
  pointer-events-none
`;

const InfluencerScrollTrack = tw.div`
  w-full flex items-start gap-3
  overflow-x-auto
  scrollbar-hide
`;

const InfluencerScrollItem = tw.button`
  flex-shrink-0
  w-[60px]
  flex flex-col items-center gap-1
`;

const InfluencerScrollAvatar = tw.div<{ $selected: boolean }>`
  w-[60px] h-[60px]
  flex flex-col items-start
  overflow-clip rounded-full
  ${({ $selected }) =>
    $selected ? 'border-[3px] border-solid border-[#18181b]' : 'border-0'}
`;

const InfluencerScrollName = tw.p`
  w-full text-center
  font-normal text-xs leading-4
  text-[#18181b] truncate
`;

// Desktop: 3x5 grid avatars
const InfluencerGridSection = tw.div`
  hidden lg:flex
  flex-1 min-w-0
  flex-col items-center gap-8
`;

const InfluencerAvatarRow = tw.div`
  w-full flex gap-5 items-start
  overflow-clip
`;

const InfluencerAvatarItem = tw.button`
  flex-1 min-w-0 min-h-0
  flex flex-col items-start gap-3
`;

const InfluencerAvatar = tw.div<{ $selected: boolean }>`
  w-full aspect-square
  flex flex-col items-start
  overflow-clip rounded-full
  ${({ $selected }) =>
    $selected ? 'border-[6px] border-solid border-[#18181b]' : 'border-0'}
`;

const AvatarPlaceholder = tw.div`
  w-full aspect-square
  bg-gray-300 rounded-full
`;

const InfluencerAvatarName = tw.p`
  w-full text-center
  font-normal text-[16.5px] leading-[22px]
  text-[#18181b]
`;
