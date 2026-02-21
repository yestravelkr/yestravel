import { Download } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { NAV_ITEMS } from '../constants';

/**
 * HeaderSection - 상단 네비게이션 헤더
 */
export function HeaderSection() {
  return (
    <HeaderWrapper>
      <HeaderInner>
        <LogoText>YESTRAVEL</LogoText>
        <NavGroup>
          {NAV_ITEMS.map(item => (
            <NavButton
              key={item.label}
              onClick={() =>
                document
                  .getElementById(item.targetId)
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <NavButtonLabel>{item.label}</NavButtonLabel>
            </NavButton>
          ))}
          <DownloadButton>
            <Download className="size-[18px]" color="white" />
            <DownloadButtonLabel>
              <span className="lg:hidden">제안서</span>
              <span className="hidden lg:inline">제안서 다운로드</span>
            </DownloadButtonLabel>
          </DownloadButton>
        </NavGroup>
      </HeaderInner>
    </HeaderWrapper>
  );
}

// --- Styled Components ---

const HeaderWrapper = tw.div`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
`;

const HeaderInner = tw.header`
  w-full
  h-[56px] tablet:h-[68px] lg:h-[76px]
  flex items-center gap-3
  bg-white overflow-clip
  py-2
`;

const LogoText = tw.p`
  flex-1 font-bold
  text-[18px] tablet:text-[21px] lg:text-[27px]
  leading-[36px] text-[#18181b]
`;

const NavGroup = tw.nav`
  flex items-center gap-0
`;

const NavButton = tw.button`
  hidden lg:flex
  h-[44px] min-w-[44px]
  items-center justify-center
  px-3 rounded-[22px]
  bg-transparent
`;

const NavButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-[#18181b] px-1
`;

const DownloadButton = tw.button`
  h-[32px] tablet:h-[36px] lg:h-[44px]
  min-w-[44px]
  flex items-center justify-center gap-1
  px-3 rounded-[22px]
  bg-[#18181b]
`;

const DownloadButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-white px-1
`;
