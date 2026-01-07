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
      {/* 비회원 로그인 섹션 */}
      <Section>
        <SectionTitle>비회원으로 시작하기</SectionTitle>
        <PhoneInput
          type="tel"
          inputMode="numeric"
          placeholder="01012345678"
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={11}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <PrimaryButton
          onClick={onRequestOTP}
          disabled={!isValidPhoneNumber || isLoading}
        >
          {isLoading ? '발송 중...' : '연락처 인증'}
        </PrimaryButton>
      </Section>

      {/* 구분선 */}
      <Divider>
        <DividerLine />
        <DividerText>OR</DividerText>
        <DividerLine />
      </Divider>

      {/* SNS 로그인 섹션 */}
      <Section>
        <SectionTitle>SNS 로그인</SectionTitle>
        <SocialButton $provider="kakao" onClick={() => onSocialLogin('kakao')}>
          <KakaoIcon />
          카카오로 시작하기
        </SocialButton>
        <SocialButton $provider="naver" onClick={() => onSocialLogin('naver')}>
          <NaverIcon />
          네이버로 시작하기
        </SocialButton>
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
  p-5
  bg-white
  flex
  flex-col
  gap-4
`;

const Section = tw.div`
  flex
  flex-col
  gap-3
`;

const SectionTitle = tw.h3`
  text-fg-neutral
  text-base
  font-semibold
  leading-5
`;

const PhoneInput = tw.input`
  h-12
  px-4
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  text-base
  font-normal
  placeholder:text-fg-muted
  focus:outline-[var(--stroke-primary)]
`;

const PrimaryButton = tw.button`
  w-full
  h-12
  px-4
  bg-bg-neutral-solid
  rounded-xl
  text-fg-on-surface
  text-base
  font-medium
  leading-5
  hover:opacity-90
  transition-opacity
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const Divider = tw.div`
  flex
  items-center
  gap-4
  py-2
`;

const DividerLine = tw.div`
  flex-1
  h-px
  bg-[var(--stroke-neutral)]
`;

const DividerText = tw.span`
  text-fg-muted
  text-sm
  font-medium
`;

const SocialButton = tw.button<{ $provider: 'kakao' | 'naver' }>`
  w-full
  h-12
  px-4
  rounded-xl
  flex
  items-center
  justify-center
  gap-2
  font-medium
  transition-opacity
  hover:opacity-90
  ${({ $provider }) =>
    $provider === 'kakao'
      ? 'bg-[#FEE500] text-[#191919]'
      : 'bg-[#03C75A] text-white'}
`;

const ErrorMessage = tw.p`
  text-fg-critical
  text-sm
`;
