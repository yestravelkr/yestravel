import tw from 'tailwind-styled-components';

/**
 * FooterSection - 하단 회사 정보 푸터
 */
export function FooterSection() {
  return (
    <FooterWrapper>
      <FooterText>
        회사명 : (주)코이스토리 | 대표이사: 김두민
        <br />
        사업자번호 : 315-87-02973
        <br />
        주소 : 서울특별시 강남구 강남대로364, 1603호
        <br />
        고객센터 : 070-4858-1401 | e-mail :{' '}
        <FooterLink href="mailto:info@yestravel.co.kr">
          info@yestravel.co.kr
        </FooterLink>
      </FooterText>
    </FooterWrapper>
  );
}

// --- Styled Components ---

const FooterWrapper = tw.footer`
  w-full
  px-4 tablet:px-5 lg:px-[120px]
  py-12 tablet:py-16 lg:py-16
  pb-24 tablet:pb-28 lg:pb-28
  bg-[#18181b]
  flex flex-col items-center justify-center
  overflow-clip
`;

const FooterText = tw.p`
  w-full text-center
  font-normal text-xs leading-4
  text-white/60
`;

const FooterLink = tw.a`
  underline text-white/60
`;
