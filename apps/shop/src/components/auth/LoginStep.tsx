/**
 * LoginStep - 로그인 폼 컴포넌트
 *
 * 휴대폰 번호 입력과 소셜 로그인 버튼을 포함합니다.
 *
 * Usage:
 * <LoginStep
 *   phoneNumber={phoneNumber}
 *   onPhoneNumberChange={setPhoneNumber}
 *   onRequestOTP={handleRequestOTP}
 *   onSocialLogin={handleSocialLogin}
 *   isLoading={isLoading}
 *   error={error}
 * />
 */

import tw from 'tailwind-styled-components';

import { Button } from '@/components/common';

export interface LoginStepProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onRequestOTP: () => void;
  onSocialLogin: (provider: 'kakao' | 'naver') => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
}

export function LoginStep({
  phoneNumber,
  onPhoneNumberChange,
  onRequestOTP,
  onSocialLogin,
  isLoading,
  error,
  onErrorClear,
}: LoginStepProps) {
  const isValidPhoneNumber = /^01[0-9]{8,9}$/.test(phoneNumber);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhoneNumberChange(e.target.value.replace(/\D/g, ''));
    onErrorClear();
  };

  return (
    <StepContent>
      {/* 상단 라운드 여백 */}
      <TopSpacer />

      {/* 로그인 타이틀 */}
      <Title>로그인</Title>

      {/* 비회원 로그인 섹션 */}
      <Section>
        <SectionLabel>비회원으로 시작하기</SectionLabel>
        <PhoneInput
          type="tel"
          inputMode="numeric"
          placeholder="연락처를 입력해 주세요."
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={11}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Section>

      <Button
        onClick={onRequestOTP}
        disabled={!isValidPhoneNumber || isLoading}
      >
        {isLoading ? '발송 중...' : '연락처 인증'}
      </Button>

      {/* 구분선 */}
      <Divider>
        <DividerLine />
        <DividerText>OR</DividerText>
        <DividerLine />
      </Divider>

      {/* SNS 로그인 섹션 */}
      <Section>
        <SectionLabel>SNS 로그인</SectionLabel>
        <Button variant="kakao" onClick={() => onSocialLogin('kakao')}>
          <KakaoIcon />
          카카오로 시작하기
        </Button>
        <Button variant="naver" onClick={() => onSocialLogin('naver')}>
          <NaverIcon />
          네이버로 시작하기
        </Button>
      </Section>
    </StepContent>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0.5C4.02944 0.5 0 3.69162 0 7.64706C0 10.1299 1.55878 12.3166 3.93157 13.5883L2.93553 17.0641C2.85763 17.3429 3.18066 17.5614 3.42439 17.3976L7.56836 14.6197C8.03619 14.6834 8.51375 14.7178 9 14.7178C13.9706 14.7178 18 11.5262 18 7.57088C18 3.61556 13.9706 0.5 9 0.5Z"
        fill="#191919"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.8493 8.56267L4.91733 0H0V16H5.15067V7.43733L11.0827 16H16V0H10.8493V8.56267Z"
        fill="white"
      />
    </svg>
  );
}

// Styled Components
const StepContent = tw.div`
  px-5
  pb-5
  bg-white
  flex
  flex-col
  gap-5
`;

const TopSpacer = tw.div`
  h-3
`;

const Title = tw.h2`
  text-fg-neutral
  text-[21px]
  font-bold
  leading-7
`;

const Section = tw.div`
  flex
  flex-col
  gap-2
`;

const SectionLabel = tw.p`
  text-fg-muted
  text-[15px]
  font-normal
  leading-5
`;

const PhoneInput = tw.input`
  h-[44px]
  px-3
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  text-[16.5px]
  font-normal
  placeholder:text-fg-placeholder
  focus:outline-[var(--stroke-primary)]
`;

const Divider = tw.div`
  flex
  items-center
  gap-3
`;

const DividerLine = tw.div`
  flex-1
  h-px
  bg-[var(--stroke-neutral)]
`;

const DividerText = tw.span`
  text-fg-muted
  text-[15px]
  font-normal
`;

const ErrorMessage = tw.p`
  text-fg-critical
  text-sm
`;
